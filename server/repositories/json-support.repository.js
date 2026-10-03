import { readFile } from 'node:fs/promises';

export class JsonSupportRepository {
  constructor(fileUrl) {
    this.fileUrl = fileUrl;
  }

  async getAll() {
    const content = await readFile(this.fileUrl, 'utf8');
    const channels = JSON.parse(content);

    if (!Array.isArray(channels)) {
      throw new TypeError('Los canales de apoyo deben ser una lista.');
    }

    return channels;
  }
}
