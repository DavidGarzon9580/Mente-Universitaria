import { clearElement, createElement, query, queryAll, setVisible } from '../utils/dom.js';
import { hasErrors, validateAiPlanForm } from '../utils/validation.js';

const DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DAY_LABELS = Object.freeze({
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
});

function currentDay() {
  const javascriptDay = new Date().getDay();
  return ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][javascriptDay];
}

function isImportablePlan(plan) {
  return Boolean(
    plan &&
    typeof plan === 'object' &&
    typeof plan.title === 'string' &&
    plan.title.trim().length >= 3 &&
    plan.title.trim().length <= 80 &&
    Array.isArray(plan.items) &&
    plan.items.length >= 1 &&
    plan.items.length <= 50 &&
    plan.items.every((item) =>
      item &&
      typeof item.title === 'string' &&
      item.title.trim().length >= 3 &&
      item.title.trim().length <= 80 &&
      DAY_ORDER.includes(item.day) &&
      Number.isFinite(Number(item.duration)) &&
      Number(item.duration) >= 1 &&
      Number(item.duration) <= 60
    )
  );
}

export class PlanController {
  constructor({ database, api, toast }) {
    this.database = database;
    this.api = api;
    this.toast = toast;
    this.plans = [];
    this.lastRequest = null;
    this.pendingProposal = null;
    this.latestSurvey = null;
    this.formPanel = query('[data-ai-form-panel]');
    this.loadingPanel = query('[data-ai-loading]');
    this.errorPanel = query('[data-ai-error]');
    this.proposalPanel = query('[data-ai-proposal]');
    this.aiForm = query('[data-ai-plan-form]');
    this.manualDialog = query('[data-manual-plan-dialog]');
    this.manualForm = query('[data-manual-plan-form]');
  }

  async init() {
    query('[data-open-ai-plan]').addEventListener('click', () => this.openAiForm());
    query('[data-close-ai-plan]').addEventListener('click', () => this.closeAiFlow());
    query('[data-edit-ai-request]').addEventListener('click', () => this.showAiState('form'));
    query('[data-retry-ai]').addEventListener('click', () => this.retryGeneration());
    query('[data-save-proposal]').addEventListener('click', () => this.saveProposal());
    this.aiForm.addEventListener('submit', (event) => this.submitAiForm(event));
    this.aiForm.addEventListener('input', () => {
      if (!query('[data-ai-form-errors]').hidden) {
        this.showValidationErrors(validateAiPlanForm(this.readAiForm()), false);
      }
    });

    queryAll('[data-open-manual-plan]').forEach((button) => {
      button.addEventListener('click', () => this.openManualDialog());
    });
    query('[data-close-manual-plan]').addEventListener('click', () => this.manualDialog.close());
    this.manualForm.addEventListener('submit', (event) => this.submitManualForm(event));

    query('[data-export-plan]').addEventListener('click', () => this.exportPlans());
    query('[data-import-plan]').addEventListener('change', (event) => this.importPlans(event));

    await this.refreshSurveyAvailability();
    await this.loadPlans();

    if (new URLSearchParams(window.location.search).get('desde') === 'encuesta' && this.latestSurvey) {
      this.useSurveyInPlan(this.latestSurvey);
      this.openAiForm();
    }
  }

  async loadPlans() {
    try {
      this.plans = await this.database.getPlans();
    } catch {
      this.plans = [];
      this.toast.show('No se pudo abrir el almacenamiento de planes en este navegador.');
    }
    this.renderPlans();
  }

  renderPlans() {
    const list = query('[data-plan-list]');
    clearElement(list);
    const entries = this.plans.flatMap((plan) => plan.items.map((item) => ({ plan, item })));
    const completed = entries.filter(({ item }) => item.completed).length;
    const activityLabel = entries.length === 1 ? 'actividad' : 'actividades';
    const completedLabel = completed === 1 ? 'completada' : 'completadas';
    query('[data-plan-summary]').textContent = `${entries.length} ${activityLabel} · ${completed} ${completedLabel}`;
    setVisible(query('[data-plan-empty]'), entries.length === 0);

    const groups = new Map(DAY_ORDER.map((day) => [day, []]));
    entries.forEach((entry) => groups.get(entry.item.day)?.push(entry));

    for (const [day, dayEntries] of groups) {
      if (!dayEntries.length) continue;
      const section = createElement('section', { className: 'card plan-day' });
      const heading = createElement('div', { className: 'plan-day__header' });
      const totalMinutes = dayEntries.reduce((total, entry) => total + Number(entry.item.duration), 0);
      heading.append(
        createElement('h3', { text: DAY_LABELS[day] }),
        createElement('span', { className: 'tag', text: `${totalMinutes} min` })
      );
      section.append(heading);
      dayEntries.forEach((entry) => section.append(this.createPlanItem(entry)));
      list.append(section);
    }
  }

  createPlanItem({ plan, item }) {
    const row = createElement('div', { className: `plan-item${item.completed ? ' is-complete' : ''}` });
    const main = createElement('label', { className: 'plan-item__main' });
    const checkbox = createElement('input', {
      attributes: {
        type: 'checkbox',
        'aria-label': `Marcar ${item.title} como completada`
      }
    });
    checkbox.checked = Boolean(item.completed);
    checkbox.addEventListener('change', () => this.toggleItem(plan.id, item.id, checkbox.checked));
    const text = createElement('span', { className: 'plan-item__text' });
    text.append(
      createElement('strong', { text: item.title }),
      createElement('p', { text: `${item.duration} minutos · ${plan.source === 'ai' ? 'Propuesta con IA' : 'Actividad añadida'}` })
    );
    main.append(checkbox, text);
    const deleteButton = createElement('button', {
      className: 'button button--text',
      text: 'Eliminar',
      attributes: { type: 'button', 'aria-label': `Eliminar ${item.title}` }
    });
    deleteButton.addEventListener('click', () => this.deleteItem(plan.id, item.id));
    row.append(main, deleteButton);
    return row;
  }

  async toggleItem(planId, itemId, completed) {
    const plan = this.plans.find((candidate) => candidate.id === planId);
    const item = plan?.items.find((candidate) => candidate.id === itemId);
    if (!plan || !item) return;
    const previousValue = item.completed;
    item.completed = completed;
    try {
      await this.database.savePlan(plan);
    } catch {
      item.completed = previousValue;
      this.toast.show('No se pudo guardar el cambio. Inténtalo de nuevo.');
    }
    this.renderPlans();
  }

  async deleteItem(planId, itemId) {
    if (!window.confirm('¿Quieres eliminar esta actividad del plan?')) return;
    const plan = this.plans.find((candidate) => candidate.id === planId);
    if (!plan) return;
    const remainingItems = plan.items.filter((item) => item.id !== itemId);
    try {
      if (remainingItems.length) await this.database.savePlan({ ...plan, items: remainingItems });
      else await this.database.deletePlan(plan.id);
      await this.loadPlans();
      this.toast.show('Actividad eliminada.');
    } catch {
      this.toast.show('No se pudo eliminar la actividad. Inténtalo de nuevo.');
    }
  }

  openAiForm() {
    this.showAiState('form');
    this.refreshSurveyAvailability();
    this.formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  closeAiFlow() {
    this.showAiState('none');
    query('#plan-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  showAiState(state) {
    setVisible(this.formPanel, state === 'form');
    setVisible(this.loadingPanel, state === 'loading');
    setVisible(this.errorPanel, state === 'error');
    setVisible(this.proposalPanel, state === 'proposal');
  }

  async refreshSurveyAvailability() {
    this.latestSurvey = await this.database.getSurvey().catch(() => null);
    const checkbox = query('[data-use-survey]');
    checkbox.disabled = !this.latestSurvey;
    if (!this.latestSurvey) checkbox.checked = false;
    query('[data-survey-consent-help]').textContent = this.latestSurvey
      ? 'Opcional. Solo se compartirá si mantienes esta casilla marcada.'
      : 'Completa la encuesta primero si deseas incluir su resumen.';
  }

  useSurveyInPlan(summary) {
    this.latestSurvey = summary;
    const firstUsefulDomain = summary.summaries
      ?.map((item) => item.domain)
      .find((domain) => ['organizacion', 'pausas', 'concentracion', 'descanso'].includes(domain));
    if (firstUsefulDomain) this.aiForm.elements.objective.value = firstUsefulDomain;
    query('[data-use-survey]').disabled = false;
    query('[data-use-survey]').checked = true;
  }

  readAiForm() {
    const formData = new FormData(this.aiForm);
    const useSurvey = formData.get('useSurvey') === 'on';
    const summaryText = useSurvey && this.latestSurvey
      ? this.latestSurvey.summaries.map((item) => `${item.label}: ${item.frequency}`).join('; ')
      : '';

    return {
      title: String(formData.get('title') || '').trim(),
      objective: String(formData.get('objective') || ''),
      duration: Number(formData.get('duration')),
      energy: String(formData.get('energy') || ''),
      days: formData.getAll('days').map(String),
      notes: String(formData.get('notes') || '').trim(),
      useSurvey,
      surveySummary: summaryText
    };
  }

  showValidationErrors(errors, focusSummary = true) {
    queryAll('[data-field-error]').forEach((element) => { element.textContent = ''; });
    queryAll('[aria-invalid="true"]', this.aiForm).forEach((element) => element.removeAttribute('aria-invalid'));

    for (const [field, message] of Object.entries(errors)) {
      const errorElement = this.aiForm.querySelector(`[data-field-error="${field}"]`);
      if (errorElement) errorElement.textContent = message;
      queryAll(`[name="${field}"]`, this.aiForm).forEach((input) => {
        input.setAttribute('aria-invalid', 'true');
      });
    }

    const summary = query('[data-ai-form-errors]');
    summary.textContent = Object.values(errors).join(' ');
    setVisible(summary, hasErrors(errors));
    if (hasErrors(errors) && focusSummary) summary.focus();
  }

  async submitAiForm(event) {
    event.preventDefault();
    const values = this.readAiForm();
    const errors = validateAiPlanForm(values);
    this.showValidationErrors(errors);
    if (hasErrors(errors)) return;

    this.lastRequest = values;
    await this.generate(values);
  }

  async generate(values) {
    this.showAiState('loading');
    try {
      const response = await this.api.generatePlan(values);
      this.pendingProposal = response.data;
      this.renderProposal(response.data);
      this.showAiState('proposal');
      this.proposalPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      query('[data-ai-error-message]').textContent = error.message;
      this.showAiState('error');
      this.errorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  retryGeneration() {
    if (this.lastRequest) this.generate(this.lastRequest);
    else this.showAiState('form');
  }

  renderProposal(result) {
    query('[data-proposal-explanation]').textContent = result.plan.explanation;
    const list = query('[data-proposal-list]');
    clearElement(list);
    for (const item of result.plan.items) {
      list.append(createElement('li', {
        text: `${item.dayLabel}: ${item.title} · ${item.duration} minutos`
      }));
    }

    const traceList = query('[data-agent-trace]');
    clearElement(traceList);
    for (const traceItem of result.trace) {
      traceList.append(createElement('li', {
        text: `${traceItem.step}. ${traceItem.tool}: ${traceItem.decision}`
      }));
    }
  }

  async saveProposal() {
    if (!this.pendingProposal?.plan) return;
    try {
      await this.database.savePlan(this.pendingProposal.plan);
    } catch {
      this.toast.show('No se pudo guardar la propuesta en este navegador. Puedes intentarlo otra vez.');
      return;
    }
    this.pendingProposal = null;
    this.showAiState('none');
    await this.loadPlans();
    this.toast.show('La propuesta se añadió a Mi plan.');
    query('#current-plan-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openManualDialog(prefill = null) {
    this.manualForm.reset();
    if (prefill) this.manualForm.elements.title.value = prefill.title;
    setVisible(query('[data-manual-plan-error]'), false);
    this.manualDialog.showModal();
  }

  async submitManualForm(event) {
    event.preventDefault();
    const formData = new FormData(this.manualForm);
    const title = String(formData.get('title') || '').trim();
    const duration = Number(formData.get('duration'));
    const day = String(formData.get('day') || '');
    const valid = title.length >= 3 && title.length <= 80 && Number.isInteger(duration) && duration >= 1 && duration <= 60 && DAY_ORDER.includes(day);
    const errorElement = query('[data-manual-plan-error]');
    errorElement.textContent = 'Revisa los campos antes de guardar. Usa una duración entera entre 1 y 60 minutos.';
    setVisible(errorElement, !valid);
    if (!valid) return;
    const submitButton = this.manualForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      await this.appendManualItem({ title, duration, day, summary: 'Actividad creada manualmente.' });
      this.manualDialog.close();
      await this.loadPlans();
      this.toast.show('Actividad guardada en Mi plan.');
    } catch {
      errorElement.textContent = 'No se pudo guardar la actividad en este navegador. Revisa que el almacenamiento esté disponible e inténtalo de nuevo.';
      setVisible(errorElement, true);
    } finally {
      submitButton.disabled = false;
    }
  }

  async appendManualItem(itemData) {
    const storedPlans = await this.database.getPlans();
    const manualPlan = storedPlans.find((plan) => plan.id === 'manual-plan') || {
      id: 'manual-plan',
      source: 'manual',
      title: 'Actividades añadidas',
      createdAt: new Date().toISOString(),
      items: []
    };
    manualPlan.items.push({
      id: crypto.randomUUID(),
      activityId: itemData.activityId || null,
      title: itemData.title,
      summary: itemData.summary,
      duration: Number(itemData.duration),
      day: itemData.day,
      dayLabel: DAY_LABELS[itemData.day],
      completed: false
    });
    await this.database.savePlan(manualPlan);
  }

  async exportPlans() {
    let plans;
    try {
      plans = await this.database.getPlans();
    } catch {
      this.toast.show('No se pudo acceder a tus actividades para exportarlas.');
      return;
    }
    if (!plans.length) {
      this.toast.show('Aún no hay actividades para exportar.');
      return;
    }
    const payload = JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), plans }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mi-plan-mente-universitaria.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async importPlans(event) {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;
    if (file.size > 1_000_000) {
      this.toast.show('El archivo supera el límite de 1 MB.');
      return;
    }

    try {
      const payload = JSON.parse(await file.text());
      if (
        payload.schemaVersion !== 1 ||
        !Array.isArray(payload.plans) ||
        payload.plans.length < 1 ||
        payload.plans.length > 100 ||
        !payload.plans.every(isImportablePlan)
      ) {
        throw new Error('Formato inválido');
      }
      for (const importedPlan of payload.plans) {
        const plan = structuredClone(importedPlan);
        plan.id = crypto.randomUUID();
        plan.items = plan.items.map((item) => ({ ...item, id: crypto.randomUUID() }));
        await this.database.savePlan(plan);
      }
      await this.loadPlans();
      this.toast.show(`Se importaron ${payload.plans.length} planes.`);
    } catch {
      this.toast.show('El archivo no corresponde a una exportación válida del proyecto.');
    }
  }
}
