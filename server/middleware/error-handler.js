import { ApplicationError } from '../errors/application.error.js';

export function errorHandler(error, _request, response, _next) {
  const knownError = error instanceof ApplicationError;
  const statusCode = knownError ? error.statusCode : 500;

  if (!knownError) console.error(error);

  response.status(statusCode).json({
    error: {
      code: knownError ? error.code : 'INTERNAL_ERROR',
      message: knownError ? error.message : 'Ocurrió un error inesperado en el servidor.',
      details: knownError ? error.details : null
    }
  });
}
