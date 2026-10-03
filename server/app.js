import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { JsonResourceRepository } from './repositories/json-resource.repository.js';
import { JsonSupportRepository } from './repositories/json-support.repository.js';
import { ResourceService } from './services/resource.service.js';
import { GroqResponsesGateway } from './gateways/groq-responses.gateway.js';
import { SearchActivitiesTool } from './tools/search-activities.tool.js';
import { ComposePlanTool } from './tools/compose-plan.tool.js';
import { ToolRegistry } from './tools/tool-registry.js';
import { PlanAgentService } from './services/plan-agent.service.js';
import { ResourceController } from './controllers/resource.controller.js';
import { PlanController } from './controllers/plan.controller.js';
import { SupportController } from './controllers/support.controller.js';
import { createResourceRouter } from './routes/resource.routes.js';
import { createPlanRouter } from './routes/plan.routes.js';
import { createSupportRouter } from './routes/support.routes.js';
import { securityHeaders } from './middleware/security-headers.js';
import { createRateLimiter } from './middleware/rate-limiter.js';
import { apiNotFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const siteDirectory = resolve(currentDirectory, '..');

export function createApp({ environment, fetchImplementation = globalThis.fetch } = {}) {
  if (!environment) throw new TypeError('La configuración del entorno es obligatoria.');

  const resourceRepository = new JsonResourceRepository(
    new URL('./data/resources.json', import.meta.url)
  );
  const supportRepository = new JsonSupportRepository(
    new URL('./data/support-channels.json', import.meta.url)
  );
  const resourceService = new ResourceService(resourceRepository);
  const aiGateway = new GroqResponsesGateway({
    apiKey: environment.groqApiKey,
    model: environment.groqModel,
    timeoutMs: environment.groqTimeoutMs,
    fetchImplementation
  });
  const toolRegistry = new ToolRegistry([
    new SearchActivitiesTool(resourceService),
    new ComposePlanTool(resourceService)
  ]);
  const planAgentService = new PlanAgentService({ aiGateway, toolRegistry });

  const resourceController = new ResourceController(resourceService);
  const planController = new PlanController(planAgentService);
  const supportController = new SupportController(supportRepository);
  const aiRateLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });

  const app = express();
  app.disable('x-powered-by');
  app.use(compression({ threshold: 1024 }));
  app.use(securityHeaders);
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      aiConfigured: aiGateway.isConfigured(),
      environment: environment.nodeEnv
    });
  });
  app.use('/api/resources', createResourceRouter(resourceController));
  app.use('/api/support-channels', createSupportRouter(supportController));
  app.use('/api/plans', createPlanRouter(planController, aiRateLimiter));
  app.use('/api', apiNotFound);

  for (const path of ['assets', 'css', 'js', 'pages']) {
    app.use(`/${path}`, express.static(resolve(siteDirectory, path)));
  }
  app.get(['/', '/index.html'], (_request, response) => {
    response.sendFile(resolve(siteDirectory, 'index.html'));
  });
  app.get('/favicon.svg', (_request, response) => {
    response.sendFile(resolve(siteDirectory, 'favicon.svg'));
  });
  app.use(errorHandler);

  return app;
}
