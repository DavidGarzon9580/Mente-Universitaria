import { Router } from 'express';

export function createPlanRouter(planController, aiRateLimiter) {
  const router = Router();
  router.post('/recommendation', aiRateLimiter, planController.generate);
  return router;
}
