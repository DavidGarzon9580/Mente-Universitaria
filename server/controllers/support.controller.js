export class SupportController {
  constructor(supportRepository) {
    this.supportRepository = supportRepository;
  }

  list = async (_request, response, next) => {
    try {
      const channels = await this.supportRepository.getAll();
      response.json({ data: channels, count: channels.length });
    } catch (error) {
      next(error);
    }
  };
}
