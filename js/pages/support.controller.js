import { clearElement, createElement, query } from '../utils/dom.js';

export class SupportController {
  constructor(api) {
    this.api = api;
    this.container = query('[data-support-channels]');
  }

  async init() {
    try {
      const response = await this.api.getSupportChannels();
      this.render(response.data);
    } catch {
      clearElement(this.container);
      const message = createElement('p', {
        text: 'No pudimos consultar los canales. Usa los enlaces de ayuda inmediata que aparecen debajo.',
        attributes: { role: 'alert' }
      });
      this.container.append(message);
    }
  }

  render(channels) {
    clearElement(this.container);
    for (const channel of channels) {
      const article = createElement('article', {
        className: `card${channel.kind === 'emergency' ? ' card--urgent' : ''}`
      });
      const link = createElement('a', {
        className: channel.kind === 'emergency' ? 'button button--danger' : 'button button--primary',
        text: channel.actionLabel,
        attributes: { href: channel.url }
      });
      if (channel.url.startsWith('http')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      article.append(
        createElement('h3', { text: channel.name }),
        createElement('p', { text: channel.description }),
        link
      );
      this.container.append(article);
    }
  }
}
