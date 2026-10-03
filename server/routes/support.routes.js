import { Router } from 'express';

export function createSupportRouter(supportController) {
  const router = Router();
  router.get('/', supportController.list);
  return router;
}
