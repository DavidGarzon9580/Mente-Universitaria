import { AccessibilityController } from './components/accessibility.controller.js';
import { Toast } from './components/toast.js';
import { ApiService } from './services/api.service.js';
import { DatabaseService } from './services/database.service.js';
import { PauseController } from './pages/pause.controller.js';
import { PlanController } from './pages/plan.controller.js';
import { ResourcesController } from './pages/resources.controller.js';
import { SupportController } from './pages/support.controller.js';
import { SurveyController } from './pages/survey.controller.js';
import { query, queryAll } from './utils/dom.js';

function setupNavigationMenu() {
  const toggle = query('[data-menu-toggle]');
  const navigation = query('[data-navigation]');

  const close = () => {
    navigation.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.visually-hidden').textContent = 'Abrir menú';
  };

  toggle.addEventListener('click', () => {
    const willOpen = !navigation.classList.contains('is-open');
    navigation.classList.toggle('is-open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
    toggle.querySelector('.visually-hidden').textContent = willOpen ? 'Cerrar menú' : 'Abrir menú';
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      const restoreFocus = navigation.contains(document.activeElement);
      close();
      if (restoreFocus) toggle.focus();
    }
  });
}

function setupUtilityDialogs() {
  const dataDialog = query('[data-data-dialog]');
  query('[data-open-data-information]').addEventListener('click', () => dataDialog.showModal());
  query('[data-close-data-information]').addEventListener('click', () => dataDialog.close());

  queryAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
}

async function bootstrap() {
  const database = new DatabaseService();
  const api = new ApiService();
  const toast = new Toast();

  await database.open().catch(() => {
    toast.show('El navegador no permitió abrir IndexedDB. El catálogo y las pausas seguirán disponibles.');
  });

  setupNavigationMenu();
  setupUtilityDialogs();

  const accessibilityController = new AccessibilityController(database, toast);
  await accessibilityController.init();

  const currentPage = document.body.dataset.page;
  if (currentPage === 'encuesta') new SurveyController(database, toast).init();
  if (currentPage === 'recursos') new ResourcesController(api, database, toast).init();
  if (currentPage === 'mi-pausa') new PauseController(toast).init();
  if (currentPage === 'mi-plan') await new PlanController({ database, api, toast }).init();
  if (currentPage === 'buscar-apoyo') await new SupportController(api).init();
}

bootstrap().catch((error) => {
  console.error(error);
  document.body.prepend(Object.assign(document.createElement('p'), {
    className: 'noscript-message',
    textContent: 'La aplicación no pudo iniciarse. Recarga la página o revisa la consola del navegador.'
  }));
});
