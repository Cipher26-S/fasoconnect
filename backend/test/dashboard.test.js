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
      name: uniqueName('Dashboard Category'),
      description: 'Temporary category for dashboard tests',
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
      experienceYears: 7,
      hourlyRate: 5000,
      city: 'Ouagadougou',
      availability: true,
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const createServiceRequest = async (server, customerToken, categoryId) => {
  const response = await request(server, '/api/service-requests', {
    method: 'POST',
    headers: authHeader(customerToken),
    body: {
      categoryId,
      title: uniqueName('Dashboard request'),
      description: 'This request is used to generate dashboard statistics.',
      location: 'Ouagadougou',
      budget: 20000,
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const completeAssignment = async (server, adminToken, artisanToken, serviceRequestId, artisanId) => {
  const assignmentResponse = await request(server, '/api/assignments', {
    method: 'POST',
    headers: authHeader(adminToken),
    body: {
      serviceRequestId,
      artisanId,
      message: 'Dashboard assignment.',
    },
  });
  assert.equal(assignmentResponse.statusCode, 201);

  const assignmentId = assignmentResponse.body.data.id;
  const acceptResponse = await request(server, `/api/assignments/${assignmentId}/accept`, {
    method: 'PATCH',
    headers: authHeader(artisanToken),
  });
  assert.equal(acceptResponse.statusCode, 200);

  const completeResponse = await request(server, `/api/assignments/${assignmentId}/complete`, {
    method: 'PATCH',
    headers: authHeader(artisanToken),
  });
  assert.equal(completeResponse.statusCode, 200);

  return assignmentResponse.body.data;
};

test('admin dashboard APIs expose statistics, rankings and monthly series', async () => {
  const server = app.listen(0);

  try {
    const health = await request(server, '/health');
    assert.equal(health.statusCode, 200);
    assert.equal(health.body.success, true);

    const admin = await registerUser(server, 'ADMIN', 'dashboard-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'dashboard-customer');
    const artisanUser = await registerUser(server, 'ARTISAN', 'dashboard-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);

    const verifyResponse = await request(server, `/api/artisans/${artisan.id}/verify`, {
      method: 'PATCH',
      headers: authHeader(admin.accessToken),
      body: { verified: true },
    });
    assert.equal(verifyResponse.statusCode, 200);

    const serviceRequest = await createServiceRequest(server, customer.accessToken, category.id);
    await completeAssignment(server, admin.accessToken, artisanUser.accessToken, serviceRequest.id, artisan.id);

    const review = await request(server, '/api/reviews', {
      method: 'POST',
      headers: authHeader(customer.accessToken),
      body: {
        serviceRequestId: serviceRequest.id,
        rating: 5,
        comment: 'Dashboard review signal.',
      },
    });
    assert.equal(review.statusCode, 201);

    const endpoints = [
      '/api/dashboard/summary',
      '/api/dashboard/users',
      '/api/dashboard/artisans',
      '/api/dashboard/categories',
      '/api/dashboard/service-requests',
      '/api/dashboard/assignments',
      '/api/dashboard/reviews',
      '/api/dashboard/notifications',
      '/api/dashboard/monthly?months=6',
      '/api/dashboard/top-artisans?page=1&limit=100',
      '/api/dashboard/top-categories?page=1&limit=100',
    ];

    const responses = {};
    for (const endpoint of endpoints) {
      const response = await request(server, endpoint, {
        headers: authHeader(admin.accessToken),
      });
      assert.equal(response.statusCode, 200, endpoint);
      assert.equal(response.body.success, true);
      responses[endpoint] = response.body;
    }

    assert.ok(responses['/api/dashboard/summary'].data.totals.users >= 3);
    assert.ok(responses['/api/dashboard/users'].data.byRole.ADMIN >= 1);
    assert.ok(responses['/api/dashboard/users'].data.byRole.CUSTOMER >= 1);
    assert.ok(responses['/api/dashboard/users'].data.byRole.ARTISAN >= 1);
    assert.ok(responses['/api/dashboard/artisans'].data.verified >= 1);
    assert.ok(responses['/api/dashboard/categories'].data.categories.length >= 1);
    assert.ok(responses['/api/dashboard/service-requests'].data.byStatus.COMPLETED >= 1);
    assert.ok(responses['/api/dashboard/assignments'].data.byStatus.COMPLETED >= 1);
    assert.ok(responses['/api/dashboard/reviews'].data.averageRating >= 5);
    assert.ok(responses['/api/dashboard/notifications'].data.unread >= 1);
    assert.equal(responses['/api/dashboard/monthly?months=6'].data.userRegistrations.length, 6);
    assert.equal(responses['/api/dashboard/monthly?months=6'].data.serviceRequests.length, 6);
    assert.equal(responses['/api/dashboard/top-artisans?page=1&limit=100'].pagination.page, 1);
    assert.ok(responses['/api/dashboard/top-artisans?page=1&limit=100'].data.some((item) => item.id === artisan.id));
    assert.equal(responses['/api/dashboard/top-categories?page=1&limit=100'].pagination.page, 1);
    assert.ok(responses['/api/dashboard/top-categories?page=1&limit=100'].data.some((item) => item.id === category.id));

    const forbidden = await request(server, '/api/dashboard/summary', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(forbidden.statusCode, 403);

    const invalidMonthly = await request(server, '/api/dashboard/monthly?months=100', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidMonthly.statusCode, 400);

    const invalidPagination = await request(server, '/api/dashboard/top-artisans?limit=500', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidPagination.statusCode, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
