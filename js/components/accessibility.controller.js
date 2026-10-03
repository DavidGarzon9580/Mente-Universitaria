import { query, queryAll } from '../utils/dom.js';

const THEMES = new Set(['light', 'dark', 'contrast']);
const FONT_SIZES = new Set([85, 90, 95, 100, 125, 150, 200]);

export class AccessibilityController {
  constructor(database, toast) {
    this.database = database;
    this.toast = toast;
    this.dialog = query('[data-accessibility-dialog]');
    this.themeButtons = queryAll('[data-theme-value]');
    this.fontButtons = queryAll('[data-font-value]');
    this.preferences = { theme: 'light', fontSize: 100 };
  }

  async init() {
    const stored = await this.database.getPreferences().catch(() => null);
    if (stored) {
      this.preferences.theme = THEMES.has(stored.theme) ? stored.theme : 'light';
      this.preferences.fontSize = FONT_SIZES.has(stored.fontSize) ? stored.fontSize : 100;
    }
    this.apply();

    for (const button of queryAll('[data-open-accessibility]')) {
      button.addEventListener('click', () => this.dialog.showModal());
    }
    for (const button of this.themeButtons) {
      button.addEventListener('click', () => this.setTheme(button.dataset.themeValue));
    }
    for (const button of this.fontButtons) {
      button.addEventListener('click', () => this.setFontSize(Number(button.dataset.fontValue)));
    }
    query('[data-reset-accessibility]').addEventListener('click', () => this.reset());
  }

  async setTheme(theme) {
    if (!THEMES.has(theme)) return;
    this.preferences.theme = theme;
    this.apply();
    await this.persist();
  }

  async setFontSize(fontSize) {
    if (!FONT_SIZES.has(fontSize)) return;
    this.preferences.fontSize = fontSize;
    this.apply();
    await this.persist();
  }

  async reset() {
    this.preferences = { theme: 'light', fontSize: 100 };
    this.apply();
    await this.persist();
    this.toast.show('Preferencias de accesibilidad restablecidas.');
  }

  apply() {
    document.body.dataset.theme = this.preferences.theme;
    document.documentElement.dataset.fontScale = String(this.preferences.fontSize);
    document.body.classList.remove('theme-dark', 'theme-contrast');
    if (this.preferences.theme !== 'light') document.body.classList.add(`theme-${this.preferences.theme}`);
    for (const size of FONT_SIZES) document.documentElement.classList.remove(`font-${size}`);
    document.documentElement.classList.add(`font-${this.preferences.fontSize}`);

    for (const button of this.themeButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.themeValue === this.preferences.theme));
    }
    for (const button of this.fontButtons) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.fontValue) === this.preferences.fontSize));
    }
  }

  async persist() {
    await this.database.savePreferences(this.preferences).catch(() => {
      this.toast.show('La preferencia se aplicó, pero no pudo guardarse.');
    });
  }
}
