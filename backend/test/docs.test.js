import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app-express.js';

const request = (server, path, options = {}) => new Promise((resolve, reject) => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const headers = { ...(options.headers || {}) };

  const client = http.request({
    hostname: '127.0.0.1',
    port,
    path,
    method: options.method || 'GET',
    headers,
  }, (res) => {
    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const contentType = res.headers['content-type'] || '';
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: contentType.includes('application/json') ? JSON.parse(data) : data,
      });
    });
  });

  client.on('error', reject);
  client.end();
});

test('Swagger UI and OpenAPI specification are exposed correctly', async () => {
  const server = app.listen(0);

  try {
    const health = await request(server, '/health');
    assert.equal(health.statusCode, 200);

    const docs = await request(server, '/api/docs');
    assert.equal(docs.statusCode, 200);
    assert.match(docs.headers['content-type'], /html/);
    assert.match(docs.body, /SwaggerUIBundle/);
    assert.match(docs.body, /\/api\/docs\/openapi\.json/);

    const openapi = await request(server, '/api/docs/openapi.json');
    assert.equal(openapi.statusCode, 200);
    assert.equal(openapi.body.openapi, '3.0.3');
    assert.equal(openapi.body.info.title, 'FasoConnect API');
    assert.equal(openapi.body.components.securitySchemes.bearerAuth.scheme, 'bearer');
    assert.equal(openapi.body.components.securitySchemes.bearerAuth.bearerFormat, 'JWT');

    const expectedPaths = [
      '/api/auth/register',
      '/api/users/profile',
      '/api/categories',
      '/api/artisans',
      '/api/service-requests',
      '/api/assignments',
      '/api/reviews',
      '/api/notifications',
      '/api/favorites/artisans',
      '/api/recommendations/artisans',
      '/api/dashboard/summary',
    ];

    for (const path of expectedPaths) {
      assert.ok(openapi.body.paths[path], `${path} should be documented`);
    }

    assert.deepEqual(
      openapi.body.paths['/api/dashboard/summary'].get.security,
      [{ bearerAuth: [] }],
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
