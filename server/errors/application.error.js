export class ApplicationError extends Error {
  constructor(message, { statusCode = 500, code = 'INTERNAL_ERROR', details = null } = {}) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message, details = null) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR', details });
    this.name = 'ValidationError';
  }
}

export class AiNotConfiguredError extends ApplicationError {
  constructor() {
    super('El generador con IA aún no está configurado en el servidor.', {
      statusCode: 503,
      code: 'AI_NOT_CONFIGURED'
    });
    this.name = 'AiNotConfiguredError';
  }
}

export class ExternalServiceError extends ApplicationError {
  constructor(message = 'El servicio de IA no está disponible en este momento.') {
    super(message, { statusCode: 502, code: 'AI_SERVICE_ERROR' });
    this.name = 'ExternalServiceError';
  }
}
