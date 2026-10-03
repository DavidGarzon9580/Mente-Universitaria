import { query, queryAll, setVisible } from '../utils/dom.js';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

export class PauseController {
  constructor(toast) {
    this.toast = toast;
    this.totalSeconds = 180;
    this.remainingSeconds = 180;
    this.interval = null;
    this.isRunning = false;
  }

  init() {
    queryAll('[data-pause-tab]').forEach((button) => {
      button.addEventListener('click', () => this.selectTab(button.dataset.pauseTab));
      button.addEventListener('keydown', (event) => this.handleTabKeyDown(event));
    });
    query('[data-toggle-pause]').addEventListener('click', () => this.toggle());
    query('[data-reset-pause]').addEventListener('click', () => this.reset());
    query('[data-pause-duration]').addEventListener('change', (event) => {
      this.totalSeconds = Number(event.target.value);
      this.reset();
    });
    queryAll('[data-quick-pause]').forEach((button) => {
      button.addEventListener('click', () => this.startQuickPause(Number(button.dataset.quickPause)));
    });
    query('[data-clear-writing]').addEventListener('click', () => {
      query('[data-pause-writing]').value = '';
      this.toast.show('El texto se borró de esta pantalla.');
    });
    document.addEventListener('app:route-change', (event) => {
      if (event.detail.route !== 'mi-pausa') this.stop();
    });
    this.render();
  }

  handleTabKeyDown(event) {
    const tabs = queryAll('[data-pause-tab]');
    const currentIndex = tabs.indexOf(event.currentTarget);
    const destinationByKey = {
      ArrowRight: (currentIndex + 1) % tabs.length,
      ArrowLeft: (currentIndex - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1
    };
    const destination = destinationByKey[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    const nextTab = tabs[destination];
    this.selectTab(nextTab.dataset.pauseTab);
    nextTab.focus();
  }

  selectTab(tabName) {
    queryAll('[data-pause-tab]').forEach((button) => {
      const isSelected = button.dataset.pauseTab === tabName;
      button.setAttribute('aria-selected', String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
    });
    queryAll('[data-pause-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.pausePanel !== tabName;
    });
    if (tabName !== 'breathing') this.stop();
  }

  startQuickPause(seconds) {
    this.selectTab('breathing');
    query('[data-pause-duration]').value = String(seconds);
    this.totalSeconds = seconds;
    this.reset();
    this.start();
    query('[data-pause-panel="breathing"]').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  toggle() {
    if (this.isRunning) this.stop();
    else this.start();
  }

  start() {
    if (this.remainingSeconds <= 0) this.reset();
    this.isRunning = true;
    setVisible(query('[data-pause-complete]'), false);
    this.interval = window.setInterval(() => this.tick(), 1000);
    this.render();
  }

  stop() {
    if (this.interval) window.clearInterval(this.interval);
    this.interval = null;
    this.isRunning = false;
    this.render();
  }

  reset() {
    this.stop();
    this.remainingSeconds = this.totalSeconds;
    setVisible(query('[data-pause-complete]'), false);
    query('[data-breathing-instruction]').textContent = 'A tu ritmo';
    query('[data-breathing-visual]').classList.remove('is-inhaling');
    this.render();
  }

  tick() {
    this.remainingSeconds -= 1;
    const elapsed = this.totalSeconds - this.remainingSeconds;
    const inhaling = Math.floor(elapsed / 4) % 2 === 0;
    query('[data-breathing-visual]').classList.toggle('is-inhaling', inhaling);
    query('[data-breathing-instruction]').textContent = inhaling ? 'Inhala' : 'Exhala';

    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = 0;
      this.stop();
      setVisible(query('[data-pause-complete]'), true);
      this.toast.show('Pausa completada.');
    }
    this.render();
  }

  render() {
    query('[data-pause-timer]').textContent = formatTime(this.remainingSeconds);
    const progress = query('[data-pause-progress]');
    progress.max = this.totalSeconds;
    progress.value = this.totalSeconds - this.remainingSeconds;
    progress.textContent = `${progress.value} de ${progress.max} segundos`;
    query('[data-toggle-pause]').textContent = this.isRunning
      ? 'Pausar'
      : this.remainingSeconds < this.totalSeconds ? 'Continuar' : 'Empezar pausa';
  }
}
