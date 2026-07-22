import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app-express.js';

const uniqueEmail = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
const uniqueName = (prefix) => `${prefix} ${Date.now()} ${Math.floor(Math.random() * 100000)}`;

const request = (server, path, options = {}) => new Promise((resolve, reject) => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const body = options.body ? JSON.stringify(options.body) : null;
  const headers = { ...(options.headers || {}) };

  if (body) {
    headers['content-type'] = 'application/json';
    headers['content-length'] = Buffer.byteLength(body);
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
    res.on('end', () => resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null }));
  });

  client.on('error', reject);
  if (body) {
    client.write(body);
  }
  client.end();
});

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const registerUser = async (server, role, prefix) => {
  const response = await request(server, '/api/auth/register', {
    method: 'POST',
    body: {
      fullName: uniqueName(prefix),
      email: uniqueEmail(prefix),
      password: 'StrongPass123',
      role,
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body;
};

const createCategory = async (server, adminToken) => {
  const response = await request(server, '/api/categories', {
    method: 'POST',
    headers: authHeader(adminToken),
    body: {
      name: uniqueName('Favorite Category'),
      description: 'Temporary category for favorite tests',
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const createArtisanProfile = async (server, artisanToken, categoryId, city = 'Ouagadougou') => {
  const response = await request(server, '/api/artisans/profile', {
    method: 'POST',
    headers: authHeader(artisanToken),
    body: {
      categoryId,
      experienceYears: 4,
      hourlyRate: 4000,
      city,
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

test('users can add, list and remove favorite artisans', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'favorite-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'favorite-customer');
    const artisanUser = await registerUser(server, 'ARTISAN', 'favorite-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);

    const created = await request(server, `/api/favorites/artisans/${artisan.id}`, {
      method: 'POST',
      headers: authHeader(customer.accessToken),
    });
    assert.equal(created.statusCode, 201);
    assert.equal(created.body.data.userId, customer.user.id);
    assert.equal(created.body.data.artisanId, artisan.id);
    assert.equal(created.body.data.artisan.hourlyRate, 4000);

    const duplicate = await request(server, `/api/favorites/artisans/${artisan.id}`, {
      method: 'POST',
      headers: authHeader(customer.accessToken),
    });
    assert.equal(duplicate.statusCode, 409);

    const list = await request(server, '/api/favorites/artisans?page=1&limit=5', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(list.statusCode, 200);
    assert.equal(list.body.pagination.total, 1);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].artisanId, artisan.id);

    const otherUserList = await request(server, '/api/favorites/artisans', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(otherUserList.statusCode, 200);
    assert.equal(otherUserList.body.data.length, 0);

    const removed = await request(server, `/api/favorites/artisans/${artisan.id}`, {
      method: 'DELETE',
      headers: authHeader(customer.accessToken),
    });
    assert.equal(removed.statusCode, 200);

    const emptyList = await request(server, '/api/favorites/artisans', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(emptyList.statusCode, 200);
    assert.equal(emptyList.body.pagination.total, 0);
    assert.equal(emptyList.body.data.length, 0);

    const removeAgain = await request(server, `/api/favorites/artisans/${artisan.id}`, {
      method: 'DELETE',
      headers: authHeader(customer.accessToken),
    });
    assert.equal(removeAgain.statusCode, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('favorite artisan validation and business rules are enforced', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'favorite-invalid-admin');
    const artisanUser = await registerUser(server, 'ARTISAN', 'favorite-invalid-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);

    const invalidId = await request(server, '/api/favorites/artisans/not-a-uuid', {
      method: 'POST',
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidId.statusCode, 400);

    const notFound = await request(server, '/api/favorites/artisans/00000000-0000-4000-8000-000000000000', {
      method: 'POST',
      headers: authHeader(admin.accessToken),
    });
    assert.equal(notFound.statusCode, 404);

    const ownFavorite = await request(server, `/api/favorites/artisans/${artisan.id}`, {
      method: 'POST',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(ownFavorite.statusCode, 400);

    const invalidPagination = await request(server, '/api/favorites/artisans?limit=500', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidPagination.statusCode, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
