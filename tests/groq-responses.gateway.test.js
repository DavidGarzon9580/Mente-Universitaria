import test from 'node:test';
import assert from 'node:assert/strict';
import { GroqResponsesGateway } from '../server/gateways/groq-responses.gateway.js';
import { AiNotConfiguredError, ExternalServiceError } from '../server/errors/application.error.js';

const request = {
  instructions: 'Usa las herramientas autorizadas.',
  input: [{ role: 'user', content: [{ type: 'input_text', text: 'Crea un plan breve.' }] }],
  tools: [{ type: 'function', name: 'buscar_actividades', parameters: { type: 'object' } }]
};

test('envía la solicitud de Responses API a Groq con el modelo y las herramientas', async () => {
  const expectedResponse = { id: 'resp_test', output: [] };
  const gateway = new GroqResponsesGateway({
    apiKey: 'gsk_test',
    model: 'openai/gpt-oss-20b',
    fetchImplementation: async (url, options) => {
      assert.equal(url, 'https://api.groq.com/openai/v1/responses');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Authorization, 'Bearer gsk_test');
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.deepEqual(JSON.parse(options.body), {
        ...request,
        model: 'openai/gpt-oss-20b',
        parallel_tool_calls: false
      });

      return { ok: true, json: async () => expectedResponse };
    }
  });

  assert.equal(gateway.isConfigured(), true);
  assert.deepEqual(await gateway.createResponse(request), expectedResponse);
});

test('rechaza solicitudes cuando falta la clave o el modelo', async () => {
  const gateway = new GroqResponsesGateway({ apiKey: '', model: 'openai/gpt-oss-20b' });

  assert.equal(gateway.isConfigured(), false);
  await assert.rejects(() => gateway.createResponse(request), AiNotConfiguredError);
});

test('convierte respuestas HTTP fallidas en un error controlado de Groq', async () => {
  const gateway = new GroqResponsesGateway({
    apiKey: 'gsk_test',
    model: 'openai/gpt-oss-20b',
    fetchImplementation: async () => ({ ok: false, status: 429 })
  });

  await assert.rejects(
    () => gateway.createResponse(request),
    (error) => error instanceof ExternalServiceError && /límites de uso gratuito/.test(error.message)
  );
});

test('oculta detalles de red y devuelve un error entendible', async () => {
  const gateway = new GroqResponsesGateway({
    apiKey: 'gsk_test',
    model: 'openai/gpt-oss-20b',
    fetchImplementation: async () => {
      throw new Error('internal network detail');
    }
  });

  await assert.rejects(
    () => gateway.createResponse(request),
    (error) => error instanceof ExternalServiceError && /conectar con Groq/.test(error.message)
  );
});
