import { Router } from 'express';

export function createResourceRouter(resourceController) {
  const router = Router();
  router.get('/', resourceController.list);
  return router;
}
