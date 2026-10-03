export class PlanController {
  constructor(planAgentService) {
    this.planAgentService = planAgentService;
  }

  generate = async (request, response, next) => {
    try {
      const result = await this.planAgentService.generate(request.body);
      response.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  };
}
