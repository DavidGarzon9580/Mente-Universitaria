export class ResourceController {
  constructor(resourceService) {
    this.resourceService = resourceService;
  }

  list = async (request, response, next) => {
    try {
      const resources = await this.resourceService.list(request.query);
      response.json({ data: resources, count: resources.length });
    } catch (error) {
      next(error);
    }
  };
}
