export function query(selector, parent = document) {
  const element = parent.querySelector(selector);
  if (!element) throw new Error(`No se encontró el elemento: ${selector}`);
  return element;
}

export function queryAll(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function clearElement(element) {
  element.replaceChildren();
}

export function setVisible(element, visible) {
  element.hidden = !visible;
}

export function createElement(tagName, { className = '', text = '', attributes = {} } = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;

  for (const [name, value] of Object.entries(attributes)) {
    if (value !== null && value !== undefined) element.setAttribute(name, String(value));
  }

  return element;
}

export function formatCategory(category) {
  const labels = {
    organizacion: 'Organización',
    pausas: 'Pausas',
    concentracion: 'Concentración',
    descanso: 'Descanso',
    apoyo: 'Apoyo'
  };
  return labels[category] || category;
}
