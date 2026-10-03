export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ApiService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async request(path, options = {}) {
    let response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers
        }
      });
    } catch {
      throw new ApiError('No fue posible conectar con la API. Comprueba que el servidor esté activo.');
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(payload.error?.message || 'La solicitud no pudo completarse.', {
        status: response.status,
        code: payload.error?.code || 'API_ERROR',
        details: payload.error?.details || null
      });
    }

    return payload;
  }

  async getResources(filters = {}) {
    if (globalThis.location?.protocol === 'file:' && typeof STATIC_RESOURCES !== 'undefined') {
      const searchText = String(filters.search || '').trim().toLocaleLowerCase('es');
      const maxDuration = Number(filters.maxDuration) || null;
      const resources = STATIC_RESOURCES.filter((resource) => {
        const searchableText = `${resource.title} ${resource.summary}`.toLocaleLowerCase('es');
        return (!filters.category || resource.category === filters.category) &&
          (!maxDuration || resource.duration <= maxDuration) &&
          (!searchText || searchableText.includes(searchText));
      });
      return { data: resources, count: resources.length };
    }

    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== null && value !== undefined) search.set(key, value);
    }
    const suffix = search.size ? `?${search.toString()}` : '';
    return this.request(`/resources${suffix}`);
  }

  async getSupportChannels() {
    if (globalThis.location?.protocol === 'file:' && typeof STATIC_SUPPORT_CHANNELS !== 'undefined') {
      return { data: STATIC_SUPPORT_CHANNELS, count: STATIC_SUPPORT_CHANNELS.length };
    }

    return this.request('/support-channels');
  }

  async generatePlan(input) {
    return this.request('/plans/recommendation', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }
}
