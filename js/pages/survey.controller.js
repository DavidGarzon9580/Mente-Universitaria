import { clearElement, createElement, query, queryAll, setVisible } from '../utils/dom.js';

const FREQUENCY_LABELS = Object.freeze({
  nunca: 'Nunca',
  raramente: 'Raramente',
  'a-veces': 'A veces',
  frecuentemente: 'Frecuentemente',
  siempre: 'Siempre'
});

const DOMAIN_LABELS = Object.freeze({
  descanso: 'Descanso',
  pausas: 'Pausas',
  organizacion: 'Organización',
  concentracion: 'Concentración',
  presion: 'Presión académica',
  apoyo: 'Apoyo'
});

const DOMAIN_MESSAGES = Object.freeze({
  descanso: 'Podrías explorar una rutina de cierre y espacios de descanso más constantes.',
  pausas: 'Una pausa breve y programada puede ayudarte a sostener el ritmo de estudio.',
  organizacion: 'Dividir las entregas en pasos concretos puede hacer la semana más manejable.',
  concentracion: 'Elegir una sola tarea y reducir interrupciones puede ayudarte a recuperar el foco.',
  presion: 'Una agenda realista y el apoyo oportuno pueden ayudarte a transitar semanas exigentes.',
  apoyo: 'Conversar con una persona de confianza o consultar un canal puede darte otra perspectiva.'
});

const POSITIVE_SCORE = Object.freeze({ nunca: 5, raramente: 4, 'a-veces': 3, frecuentemente: 2, siempre: 1 });
const PRESSURE_SCORE = Object.freeze({ nunca: 1, raramente: 2, 'a-veces': 3, frecuentemente: 4, siempre: 5 });

export class SurveyController {
  constructor(database, toast) {
    this.database = database;
    this.toast = toast;
    this.intro = query('[data-survey-intro]');
    this.form = query('[data-survey-form]');
    this.review = query('[data-survey-review]');
    this.result = query('[data-survey-result]');
    this.questions = queryAll('[data-survey-question]', this.form);
    this.currentQuestion = 0;
    this.latestSummary = null;
  }

  init() {
    query('[data-start-survey]').addEventListener('click', () => this.start());
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.next();
    });
    query('[data-survey-previous]').addEventListener('click', () => this.previous());
    query('[data-edit-survey]').addEventListener('click', () => this.edit());
    query('[data-complete-survey]').addEventListener('click', () => this.complete());
    query('[data-repeat-survey]').addEventListener('click', () => this.reset());
    this.form.addEventListener('change', () => setVisible(query('[data-survey-error]'), false));
  }

  start() {
    setVisible(this.intro, false);
    setVisible(this.review, false);
    setVisible(this.result, false);
    setVisible(this.form, true);
    this.showQuestion(0);
  }

  showQuestion(index) {
    this.currentQuestion = Math.max(0, Math.min(index, this.questions.length - 1));
    this.questions.forEach((question, questionIndex) => {
      question.hidden = questionIndex !== this.currentQuestion;
    });

    query('[data-survey-counter]').textContent = `Pregunta ${this.currentQuestion + 1} de ${this.questions.length}`;
    query('[data-survey-progress]').value = this.currentQuestion + 1;
    query('[data-survey-previous]').textContent = this.currentQuestion === 0 ? 'Volver' : 'Anterior';
    query('[data-survey-next]').textContent = this.currentQuestion === this.questions.length - 1 ? 'Revisar' : 'Siguiente';
    setVisible(query('[data-survey-error]'), false);

    const legend = this.questions[this.currentQuestion].querySelector('legend');
    if (legend) {
      legend.tabIndex = -1;
      legend.focus();
    }
  }

  currentAnswer() {
    return this.questions[this.currentQuestion].querySelector('input:checked');
  }

  next() {
    if (!this.currentAnswer()) {
      setVisible(query('[data-survey-error]'), true);
      this.questions[this.currentQuestion].querySelector('input')?.focus();
      return;
    }

    if (this.currentQuestion < this.questions.length - 1) {
      this.showQuestion(this.currentQuestion + 1);
      return;
    }

    this.showReview();
  }

  previous() {
    if (this.currentQuestion === 0) {
      setVisible(this.form, false);
      setVisible(this.intro, true);
      return;
    }
    this.showQuestion(this.currentQuestion - 1);
  }

  readResponses() {
    return Object.fromEntries(this.questions.map((question) => {
      const answer = question.querySelector('input:checked');
      return [question.dataset.domain, answer?.value || ''];
    }));
  }

  showReview() {
    const responses = this.readResponses();
    const reviewList = query('[data-survey-review-list]');
    clearElement(reviewList);

    for (const [domain, value] of Object.entries(responses)) {
      reviewList.append(
        createElement('dt', { text: DOMAIN_LABELS[domain] }),
        createElement('dd', { text: FREQUENCY_LABELS[value] })
      );
    }

    setVisible(this.form, false);
    setVisible(this.review, true);
    query('#survey-review-title').focus?.();
  }

  edit() {
    setVisible(this.review, false);
    setVisible(this.form, true);
    this.showQuestion(this.questions.length - 1);
  }

  buildSummary(responses) {
    return Object.entries(responses)
      .map(([domain, frequency]) => ({
        domain,
        label: DOMAIN_LABELS[domain],
        frequency: FREQUENCY_LABELS[frequency],
        rawFrequency: frequency,
        attention: domain === 'presion' ? PRESSURE_SCORE[frequency] : POSITIVE_SCORE[frequency],
        message: DOMAIN_MESSAGES[domain]
      }))
      .sort((first, second) => second.attention - first.attention)
      .slice(0, 3);
  }

  async complete() {
    const responses = this.readResponses();
    const summaries = this.buildSummary(responses);
    this.latestSummary = { completedAt: new Date().toISOString(), responses, summaries };
    await this.database.saveSurvey(this.latestSummary).catch(() => {
      this.toast.show('El resumen se mostró, pero no pudo guardarse en este navegador.');
    });
    this.renderSummary(summaries);
    setVisible(this.review, false);
    setVisible(this.result, true);
    query('#survey-result-title').focus();
  }

  renderSummary(summaries) {
    const container = query('[data-survey-summary]');
    clearElement(container);

    for (const summary of summaries) {
      const article = createElement('article');
      article.append(
        createElement('h3', { text: `${summary.label} · ${summary.frequency}` }),
        createElement('p', { text: summary.message })
      );
      container.append(article);
    }
  }

  reset() {
    this.form.reset();
    this.latestSummary = null;
    setVisible(this.result, false);
    setVisible(this.review, false);
    setVisible(this.intro, true);
    setVisible(this.form, false);
    this.currentQuestion = 0;
  }
}
