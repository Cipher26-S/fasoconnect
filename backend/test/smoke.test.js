import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app-express.js';

const uniqueEmail = () => `auth-test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

const request = (server, path, options = {}) => new Promise((resolve, reject) => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const headers = { ...(options.headers || {}) };
  if (options.body) {
    headers['content-type'] = 'application/json';
  }
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
    res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
  });
  client.on('error', reject);
  if (options.body) {
    client.write(JSON.stringify(options.body));
  }
  client.end();
});

test('smoke routes respond correctly', async () => {
  const server = app.listen(0);

  try {
    const health = await request(server, '/health');
    assert.equal(health.statusCode, 200);

    const categories = await request(server, '/api/categories');
    assert.equal(categories.statusCode, 200);

    const profile = await request(server, '/api/users/profile', {
      headers: { Authorization: 'Bearer invalid' },
    });
    assert.equal(profile.statusCode, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('auth flow registers, logs in, refreshes and logs out', async () => {
  const server = app.listen(0);
  const email = uniqueEmail();
  const password = 'StrongPass123';

  try {
    const registerResponse = await request(server, '/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Auth Test User',
        email,
        password,
        role: 'CUSTOMER',
      },
    });
    assert.equal(registerResponse.statusCode, 201);
    const registerBody = JSON.parse(registerResponse.body);
    assert.ok(registerBody.accessToken);
    assert.ok(registerBody.refreshToken);

    const loginResponse = await request(server, '/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });
    assert.equal(loginResponse.statusCode, 200);
    const loginBody = JSON.parse(loginResponse.body);
    assert.ok(loginBody.accessToken);
    assert.ok(loginBody.refreshToken);

    const refreshResponse = await request(server, '/api/auth/refresh', {
      method: 'POST',
      body: {
        refreshToken: loginBody.refreshToken,
      },
    });
    assert.equal(refreshResponse.statusCode, 200);
    const refreshBody = JSON.parse(refreshResponse.body);
    assert.ok(refreshBody.accessToken);

    const logoutResponse = await request(server, '/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginBody.accessToken}`,
      },
    });
    assert.equal(logoutResponse.statusCode, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('artisan profile update is allowed for authenticated artisans', async () => {
  const server = app.listen(0);
  const adminEmail = uniqueEmail();
  const artisanEmail = uniqueEmail();
  const password = 'StrongPass123';

  try {
    const adminRegisterResponse = await request(server, '/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Admin Test User',
        email: adminEmail,
        password,
        role: 'ADMIN',
      },
    });
    assert.equal(adminRegisterResponse.statusCode, 201);

    const adminLoginResponse = await request(server, '/api/auth/login', {
      method: 'POST',
      body: {
        email: adminEmail,
        password,
      },
    });
    assert.equal(adminLoginResponse.statusCode, 200);
    const adminLoginBody = JSON.parse(adminLoginResponse.body);

    const categoryResponse = await request(server, '/api/categories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminLoginBody.accessToken}`,
      },
      body: {
        name: `Test Category ${Date.now()}`,
        description: 'Temporary category for artisan tests',
      },
    });
    assert.equal(categoryResponse.statusCode, 201);
    const categoryBody = JSON.parse(categoryResponse.body);

    const artisanRegisterResponse = await request(server, '/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Artisan Test User',
        email: artisanEmail,
        password,
        role: 'ARTISAN',
      },
    });
    assert.equal(artisanRegisterResponse.statusCode, 201);

    const artisanLoginResponse = await request(server, '/api/auth/login', {
      method: 'POST',
      body: {
        email: artisanEmail,
        password,
      },
    });
    assert.equal(artisanLoginResponse.statusCode, 200);
    const artisanLoginBody = JSON.parse(artisanLoginResponse.body);

    const profileResponse = await request(server, '/api/artisans/profile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${artisanLoginBody.accessToken}`,
      },
      body: {
        categoryId: categoryBody.data.id,
        experienceYears: 3,
        hourlyRate: 2500,
        city: 'Ouagadougou',
        verified: true,
      },
    });

    assert.equal(profileResponse.statusCode, 201);
    const profileBody = JSON.parse(profileResponse.body);
    assert.equal(profileBody.data.verified, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
