import { ValidationError } from '../errors/application.error.js';

export class ToolRegistry {
  constructor(tools = []) {
    this.tools = new Map(tools.map((tool) => [tool.name, tool]));
  }

  get definitions() {
    return [...this.tools.values()].map((tool) => tool.definition);
  }

  async execute(name, argumentsObject, context) {
    const tool = this.tools.get(name);
    if (!tool) throw new ValidationError(`La herramienta ${name} no está permitida.`);
    return tool.execute(argumentsObject, context);
  }
}
