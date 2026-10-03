import { ApplicationError } from '../errors/application.error.js';

export function apiNotFound(request, _response, next) {
  next(new ApplicationError(`No existe el endpoint ${request.method} ${request.originalUrl}.`, {
    statusCode: 404,
    code: 'NOT_FOUND'
  }));
}
