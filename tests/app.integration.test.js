import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server/app.js';

async function startTestServer() {
  const environment = {
    nodeEnv: 'test',
    groqApiKey: '',
    groqModel: 'test-model',
    groqTimeoutMs: 1000
  };
  const server = createApp({ environment }).listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

test('expone el estado de la API y sirve las seis páginas independientes', async (context) => {
  const { server, baseUrl } = await startTestServer();
  context.after(() => server.close());

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.equal(health.status, 'ok');
  assert.equal(health.aiConfigured, false);

  const htmlResponse = await fetch(baseUrl);
  const html = await htmlResponse.text();
  assert.equal(htmlResponse.status, 200);
  assert.match(html, /data-page="inicio"/);
  assert.match(html, /href="\.\/pages\/recursos\.html"/);
  assert.match(html, /href="\.\/css\/comun\.css"/);
  assert.match(html, /href="\.\/css\/inicio\.css"/);

  const pages = ['encuesta', 'recursos', 'mi-pausa', 'mi-plan', 'buscar-apoyo'];
  for (const page of pages) {
    const response = await fetch(`${baseUrl}/pages/${page}.html`);
    const pageHtml = await response.text();
    assert.equal(response.status, 200, `La página ${page} debe servirse correctamente.`);
    assert.match(pageHtml, new RegExp(`data-page="${page}"`));
    assert.match(pageHtml, /href="\.\.\/css\/comun\.css"/);
    assert.match(pageHtml, new RegExp(`href="\\.\\./css/${page}\\.css"`));
  }

  const guideResponse = await fetch(`${baseUrl}/assets/guides/organizacion-semanal.html`);
  const guideHtml = await guideResponse.text();
  assert.equal(guideResponse.status, 200);
  assert.match(guideHtml, /href="\.\.\/\.\.\/css\/comun\.css"/);
  assert.match(guideHtml, /href="\.\.\/\.\.\/css\/guias\.css"/);

  for (const asset of [
    '/css/comun.css',
    '/css/inicio.css',
    '/js/app.bundle.js',
    '/assets/images/resource-hero.webp',
    '/assets/pdfs/guia-organizacion-semanal.pdf'
  ]) {
    const response = await fetch(`${baseUrl}${asset}`);
    assert.equal(response.status, 200, `El recurso ${asset} debe servirse correctamente.`);
  }

  for (const internalFile of ['/server/app.js', '/package.json', '/.env.example', '/docs/COMO_EJECUTAR.md']) {
    const response = await fetch(`${baseUrl}${internalFile}`);
    assert.equal(response.status, 404, `${internalFile} no debe publicarse.`);
  }
});

test('comprime hojas de estilo cuando el navegador acepta gzip', async (context) => {
  const { server, baseUrl } = await startTestServer();
  context.after(() => server.close());

  const response = await fetch(`${baseUrl}/css/comun.css`, {
    headers: { 'Accept-Encoding': 'gzip' }
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-encoding'), 'gzip');
  assert.match(await response.text(), /\.site-header/);
});

test('devuelve recursos y valida filtros', async (context) => {
  const { server, baseUrl } = await startTestServer();
  context.after(() => server.close());

  const validResponse = await fetch(`${baseUrl}/api/resources?category=pausas&maxDuration=5`);
  const validBody = await validResponse.json();
  assert.equal(validResponse.status, 200);
  assert.ok(validBody.data.length >= 1);

  const invalidResponse = await fetch(`${baseUrl}/api/resources?category=clinico`);
  assert.equal(invalidResponse.status, 400);
});

test('informa de forma explícita cuando la IA no está configurada', async (context) => {
  const { server, baseUrl } = await startTestServer();
  context.after(() => server.close());

  const response = await fetch(`${baseUrl}/api/plans/recommendation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Mi plan de estudio',
      objective: 'organizacion',
      duration: 10,
      energy: 'baja',
      days: ['lunes'],
      notes: '',
      useSurvey: false
    })
  });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error.code, 'AI_NOT_CONFIGURED');
});
