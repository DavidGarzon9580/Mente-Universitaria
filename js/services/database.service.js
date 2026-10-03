const DATABASE_NAME = 'mente-universitaria';
const DATABASE_VERSION = 1;
const PREFERENCES_KEY = 'mente-universitaria:accessibility';

const STORES = Object.freeze({
  plans: 'plans',
  preferences: 'preferences',
  survey: 'survey',
  savedResources: 'saved-resources'
});

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result), { once: true });
    request.addEventListener('error', () => reject(request.error), { once: true });
  });
}

function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => resolve(), { once: true });
    transaction.addEventListener('abort', () => reject(transaction.error), { once: true });
    transaction.addEventListener('error', () => reject(transaction.error), { once: true });
  });
}

export class DatabaseService {
  constructor(indexedDb = globalThis.indexedDB) {
    this.indexedDb = indexedDb;
    this.databasePromise = null;
  }

  open() {
    if (!this.indexedDb) return Promise.reject(new Error('IndexedDB no está disponible.'));
    if (this.databasePromise) return this.databasePromise;

    this.databasePromise = new Promise((resolve, reject) => {
      const request = this.indexedDb.open(DATABASE_NAME, DATABASE_VERSION);

      request.addEventListener('upgradeneeded', () => {
        const database = request.result;
        for (const storeName of Object.values(STORES)) {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      });
      request.addEventListener('success', () => resolve(request.result), { once: true });
      request.addEventListener('error', () => reject(request.error), { once: true });
    });

    return this.databasePromise;
  }

  async getAll(storeName) {
    const database = await this.open();
    const transaction = database.transaction(storeName, 'readonly');
    return requestToPromise(transaction.objectStore(storeName).getAll());
  }

  async get(storeName, id) {
    const database = await this.open();
    const transaction = database.transaction(storeName, 'readonly');
    return requestToPromise(transaction.objectStore(storeName).get(id));
  }

  async put(storeName, value) {
    const database = await this.open();
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(value);
    await transactionToPromise(transaction);
    return value;
  }

  async delete(storeName, id) {
    const database = await this.open();
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(id);
    await transactionToPromise(transaction);
  }

  async getPlans() { return this.getAll(STORES.plans); }
  async savePlan(plan) { return this.put(STORES.plans, plan); }
  async deletePlan(id) { return this.delete(STORES.plans, id); }

  async addResourceToPlan(resource) {
    const plans = await this.getPlans();
    if (plans.some((plan) => plan.items.some((item) => item.activityId === resource.id))) {
      return false;
    }

    const day = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][new Date().getDay()];
    const dayLabels = {
      lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves',
      viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
    };
    const manualPlan = plans.find((plan) => plan.id === 'manual-plan') || {
      id: 'manual-plan',
      source: 'manual',
      title: 'Actividades añadidas',
      createdAt: new Date().toISOString(),
      items: []
    };

    manualPlan.items.push({
      id: crypto.randomUUID(),
      activityId: resource.id,
      title: resource.title,
      summary: resource.summary,
      duration: Number(resource.duration),
      day,
      dayLabel: dayLabels[day],
      completed: false
    });
    await this.savePlan(manualPlan);
    return true;
  }

  async getPreferences() {
    try {
      const cached = JSON.parse(globalThis.localStorage?.getItem(PREFERENCES_KEY) || 'null');
      if (cached && typeof cached === 'object') return cached;
    } catch {
      // Los navegadores que bloquean localStorage todavía pueden permitir IndexedDB.
    }
    return this.get(STORES.preferences, 'accessibility');
  }

  async savePreferences(value) {
    const preferences = { id: 'accessibility', ...value };
    let cached = false;
    try {
      if (globalThis.localStorage) {
        globalThis.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        cached = true;
      }
    } catch {
      // IndexedDB sigue siendo una alternativa si la caché síncrona no está disponible.
    }
    try {
      return await this.put(STORES.preferences, preferences);
    } catch (error) {
      if (!cached) throw error;
      return preferences;
    }
  }
  async getSurvey() { return this.get(STORES.survey, 'latest'); }
  async saveSurvey(value) { return this.put(STORES.survey, { id: 'latest', ...value }); }
  async saveResource(value) { return this.put(STORES.savedResources, value); }
}
