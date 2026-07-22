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
      name: uniqueName('Service Request Category'),
      description: 'Temporary category for service request tests',
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const createArtisanProfile = async (server, artisanToken, categoryId) => {
  const response = await request(server, '/api/artisans/profile', {
    method: 'POST',
    headers: authHeader(artisanToken),
    body: {
      categoryId,
      experienceYears: 5,
      hourlyRate: 3500,
      city: 'Ouagadougou',
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const createServiceRequest = async (server, customerToken, categoryId, title = 'Repair leaking kitchen pipe') => {
  const response = await request(server, '/api/service-requests', {
    method: 'POST',
    headers: authHeader(customerToken),
    body: {
      categoryId,
      title,
      description: 'The kitchen pipe is leaking and needs a repair visit.',
      location: 'Ouagadougou',
      budget: 15000,
      scheduledAt: '2026-07-10T09:00:00.000Z',
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

test('service request workflow supports scoped CRUD, search, filters, sorting and status transitions', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'service-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'service-customer');
    const artisanUser = await registerUser(server, 'ARTISAN', 'service-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);

    const created = await createServiceRequest(server, customer.accessToken, category.id);
    assert.equal(created.status, 'PENDING');
    assert.equal(created.categoryId, category.id);

    const customerList = await request(
      server,
      `/api/service-requests?search=pipe&category=${category.id}&status=PENDING&city=Ouagadougou&page=1&limit=5&sortBy=createdAt&sortOrder=desc`,
      { headers: authHeader(customer.accessToken) },
    );
    assert.equal(customerList.statusCode, 200);
    assert.equal(customerList.body.pagination.page, 1);
    assert.equal(customerList.body.data.length, 1);
    assert.equal(customerList.body.data[0].id, created.id);

    const assignResponse = await request(server, `/api/service-requests/${created.id}`, {
      method: 'PUT',
      headers: authHeader(admin.accessToken),
      body: { artisanId: artisan.id },
    });
    assert.equal(assignResponse.statusCode, 200);
    assert.equal(assignResponse.body.data.status, 'ASSIGNED');
    assert.equal(assignResponse.body.data.artisanId, artisan.id);

    const artisanList = await request(server, '/api/service-requests?sortBy=status&sortOrder=asc', {
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(artisanList.statusCode, 200);
    assert.equal(artisanList.body.data.length, 1);
    assert.equal(artisanList.body.data[0].id, created.id);

    for (const status of ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED']) {
      const statusResponse = await request(server, `/api/service-requests/${created.id}/status`, {
        method: 'PATCH',
        headers: authHeader(artisanUser.accessToken),
        body: { status },
      });
      assert.equal(statusResponse.statusCode, 200);
      assert.equal(statusResponse.body.data.status, status);
    }

    const cancelCompleted = await request(server, `/api/service-requests/${created.id}/status`, {
      method: 'PATCH',
      headers: authHeader(customer.accessToken),
      body: { status: 'CANCELLED' },
    });
    assert.equal(cancelCompleted.statusCode, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('service request validation and delete authorization are enforced', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'service-delete-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'service-delete-customer');
    const category = await createCategory(server, admin.accessToken);
    const created = await createServiceRequest(server, customer.accessToken, category.id, 'Install bathroom sink');

    const invalidQuery = await request(server, '/api/service-requests?sortBy=updatedAt', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidQuery.statusCode, 400);

    const customerDelete = await request(server, `/api/service-requests/${created.id}`, {
      method: 'DELETE',
      headers: authHeader(customer.accessToken),
    });
    assert.equal(customerDelete.statusCode, 403);

    const adminDelete = await request(server, `/api/service-requests/${created.id}`, {
      method: 'DELETE',
      headers: authHeader(admin.accessToken),
    });
    assert.equal(adminDelete.statusCode, 200);

    const deletedLookup = await request(server, `/api/service-requests/${created.id}`, {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(deletedLookup.statusCode, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
