import { createElement, query } from '../utils/dom.js';

export class Toast {
  constructor(region = query('[data-toast-region]')) {
    this.region = region;
  }

  show(message, { duration = 4200 } = {}) {
    const toast = createElement('div', {
      className: 'toast',
      text: message,
      attributes: { role: 'status' }
    });
    this.region.append(toast);
    window.setTimeout(() => toast.remove(), duration);
  }
}
