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
      name: uniqueName('Notification Category'),
      description: 'Temporary category for notification tests',
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
      hourlyRate: 5000,
      city: 'Ouagadougou',
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
      title: uniqueName('Notification request'),
      description: 'This request is used to test notification events.',
      location: 'Ouagadougou',
      budget: 25000,
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const createAssignment = async (server, adminToken, serviceRequestId, artisanId) => {
  const response = await request(server, '/api/assignments', {
    method: 'POST',
    headers: authHeader(adminToken),
    body: {
      serviceRequestId,
      artisanId,
      message: 'Notification workflow assignment.',
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

test('notifications are created from assignment events and can be read by their owner', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'notification-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'notification-customer');
    const otherCustomer = await registerUser(server, 'CUSTOMER', 'notification-other-customer');
    const artisanUser = await registerUser(server, 'ARTISAN', 'notification-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);
    const serviceRequest = await createServiceRequest(server, customer.accessToken, category.id);
    const assignment = await createAssignment(server, admin.accessToken, serviceRequest.id, artisan.id);

    const artisanNotifications = await request(server, '/api/notifications?isRead=false&page=1&limit=5', {
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(artisanNotifications.statusCode, 200);
    assert.equal(artisanNotifications.body.unreadCount, 1);
    assert.equal(artisanNotifications.body.pagination.page, 1);
    assert.equal(artisanNotifications.body.data.length, 1);
    assert.equal(artisanNotifications.body.data[0].title, 'New assignment');
    assert.equal(artisanNotifications.body.data[0].userId, artisanUser.user.id);

    const notificationId = artisanNotifications.body.data[0].id;
    const details = await request(server, `/api/notifications/${notificationId}`, {
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(details.statusCode, 200);
    assert.equal(details.body.data.id, notificationId);

    const forbiddenDetails = await request(server, `/api/notifications/${notificationId}`, {
      headers: authHeader(otherCustomer.accessToken),
    });
    assert.equal(forbiddenDetails.statusCode, 403);

    const marked = await request(server, `/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(marked.statusCode, 200);
    assert.equal(marked.body.data.isRead, true);

    const unreadAfterMark = await request(server, '/api/notifications?isRead=false', {
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(unreadAfterMark.statusCode, 200);
    assert.equal(unreadAfterMark.body.unreadCount, 0);
    assert.equal(unreadAfterMark.body.data.length, 0);

    const accepted = await request(server, `/api/assignments/${assignment.id}/accept`, {
      method: 'PATCH',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(accepted.statusCode, 200);

    const completed = await request(server, `/api/assignments/${assignment.id}/complete`, {
      method: 'PATCH',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(completed.statusCode, 200);

    const customerNotifications = await request(server, '/api/notifications?isRead=false&limit=10', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(customerNotifications.statusCode, 200);
    assert.equal(customerNotifications.body.unreadCount, 2);
    assert.equal(customerNotifications.body.data.length, 2);
    assert.deepEqual(
      customerNotifications.body.data.map((notification) => notification.title).sort(),
      ['Assignment accepted', 'Service completed'],
    );

    const markAll = await request(server, '/api/notifications/read-all', {
      method: 'PATCH',
      headers: authHeader(customer.accessToken),
    });
    assert.equal(markAll.statusCode, 200);
    assert.equal(markAll.body.data.updatedCount, 2);

    const customerUnread = await request(server, '/api/notifications?isRead=false', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(customerUnread.statusCode, 200);
    assert.equal(customerUnread.body.unreadCount, 0);

    const adminFiltered = await request(server, `/api/notifications?user=${customer.user.id}&limit=10`, {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(adminFiltered.statusCode, 200);
    assert.equal(adminFiltered.body.data.length, 2);
    assert.ok(adminFiltered.body.data.every((notification) => notification.userId === customer.user.id));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('notification validation rejects invalid parameters and query filters', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'notification-invalid-admin');

    const invalidId = await request(server, '/api/notifications/not-a-uuid', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidId.statusCode, 400);

    const invalidRead = await request(server, '/api/notifications?isRead=maybe', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidRead.statusCode, 400);

    const invalidDate = await request(server, '/api/notifications?date=07-07-2026', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidDate.statusCode, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
