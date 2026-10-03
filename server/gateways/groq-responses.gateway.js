import { AiNotConfiguredError, ExternalServiceError } from '../errors/application.error.js';

const GROQ_RESPONSES_URL = 'https://api.groq.com/openai/v1/responses';

export class GroqResponsesGateway {
  constructor({ apiKey, model, timeoutMs = 30000, fetchImplementation = globalThis.fetch }) {
    this.apiKey = apiKey;
    this.model = model;
    this.timeoutMs = timeoutMs;
    this.fetchImplementation = fetchImplementation;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.model);
  }

  async createResponse({ instructions, input, tools }) {
    if (!this.isConfigured()) throw new AiNotConfiguredError();

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImplementation(GROQ_RESPONSES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          instructions,
          input,
          tools,
          parallel_tool_calls: false
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new ExternalServiceError(
          'Groq rechazó la solicitud. Verifica la clave, el modelo y los límites de uso gratuito.'
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof AiNotConfiguredError || error instanceof ExternalServiceError) throw error;
      if (error.name === 'AbortError') {
        throw new ExternalServiceError('Groq tardó demasiado en responder. Intenta nuevamente.');
      }
      throw new ExternalServiceError('No fue posible conectar con Groq en este momento.');
    } finally {
      clearTimeout(timeout);
    }
  }
}
