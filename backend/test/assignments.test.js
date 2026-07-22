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
      name: uniqueName('Assignment Category'),
      description: 'Temporary category for assignment tests',
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

const createServiceRequest = async (server, customerToken, categoryId, title = 'Repair assignment test sink') => {
  const response = await request(server, '/api/service-requests', {
    method: 'POST',
    headers: authHeader(customerToken),
    body: {
      categoryId,
      title,
      description: 'This request is used to test assignment module behavior.',
      location: 'Ouagadougou',
      budget: 20000,
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
      message: 'Please review this assignment.',
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

test('assignment workflow supports create, list, details, accept and complete', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'assignment-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'assignment-customer');
    const artisanUser = await registerUser(server, 'ARTISAN', 'assignment-artisan');
    const otherArtisanUser = await registerUser(server, 'ARTISAN', 'assignment-other-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);
    await createArtisanProfile(server, otherArtisanUser.accessToken, category.id, 'Bobo-Dioulasso');
    const serviceRequest = await createServiceRequest(server, customer.accessToken, category.id);

    const assignment = await createAssignment(server, admin.accessToken, serviceRequest.id, artisan.id);
    assert.equal(assignment.status, 'PENDING');
    assert.equal(assignment.serviceRequest.status, 'ASSIGNED');
    assert.equal(assignment.artisanId, artisan.id);

    const duplicate = await request(server, '/api/assignments', {
      method: 'POST',
      headers: authHeader(admin.accessToken),
      body: {
        serviceRequestId: serviceRequest.id,
        artisanId: artisan.id,
      },
    });
    assert.equal(duplicate.statusCode, 409);

    const list = await request(
      server,
      `/api/assignments?status=PENDING&artisan=${artisan.id}&serviceRequest=${serviceRequest.id}&limit=5&page=1`,
      { headers: authHeader(admin.accessToken) },
    );
    assert.equal(list.statusCode, 200);
    assert.equal(list.body.pagination.page, 1);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].id, assignment.id);

    const artisanList = await request(server, '/api/assignments', {
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(artisanList.statusCode, 200);
    assert.equal(artisanList.body.data.length, 1);
    assert.equal(artisanList.body.data[0].id, assignment.id);

    const details = await request(server, `/api/assignments/${assignment.id}`, {
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(details.statusCode, 200);
    assert.equal(details.body.data.id, assignment.id);

    const wrongArtisanAccept = await request(server, `/api/assignments/${assignment.id}/accept`, {
      method: 'PATCH',
      headers: authHeader(otherArtisanUser.accessToken),
    });
    assert.equal(wrongArtisanAccept.statusCode, 403);

    const accepted = await request(server, `/api/assignments/${assignment.id}/accept`, {
      method: 'PATCH',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(accepted.statusCode, 200);
    assert.equal(accepted.body.data.status, 'ACCEPTED');
    assert.equal(accepted.body.data.serviceRequest.status, 'ACCEPTED');

    const invalidReject = await request(server, `/api/assignments/${assignment.id}/reject`, {
      method: 'PATCH',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(invalidReject.statusCode, 400);

    const completed = await request(server, `/api/assignments/${assignment.id}/complete`, {
      method: 'PATCH',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(completed.statusCode, 200);
    assert.equal(completed.body.data.status, 'COMPLETED');
    assert.equal(completed.body.data.serviceRequest.status, 'COMPLETED');

    const serviceRequestDetails = await request(server, `/api/service-requests/${serviceRequest.id}`, {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(serviceRequestDetails.statusCode, 200);
    assert.equal(serviceRequestDetails.body.data.status, 'COMPLETED');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('assignment reject, unauthorized access, invalid UUID and invalid transitions are enforced', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'assignment-reject-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'assignment-reject-customer');
    const artisanUser = await registerUser(server, 'ARTISAN', 'assignment-reject-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);
    const serviceRequest = await createServiceRequest(server, customer.accessToken, category.id, 'Paint assignment test room');
    const assignment = await createAssignment(server, admin.accessToken, serviceRequest.id, artisan.id);

    const customerList = await request(server, '/api/assignments', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(customerList.statusCode, 403);

    const invalidId = await request(server, '/api/assignments/not-a-uuid', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidId.statusCode, 400);

    const invalidComplete = await request(server, `/api/assignments/${assignment.id}/complete`, {
      method: 'PATCH',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(invalidComplete.statusCode, 400);

    const rejected = await request(server, `/api/assignments/${assignment.id}/reject`, {
      method: 'PATCH',
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(rejected.statusCode, 200);
    assert.equal(rejected.body.data.status, 'REJECTED');
    assert.equal(rejected.body.data.serviceRequest.status, 'PENDING');

    const serviceRequestDetails = await request(server, `/api/service-requests/${serviceRequest.id}`, {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(serviceRequestDetails.statusCode, 200);
    assert.equal(serviceRequestDetails.body.data.status, 'PENDING');
    assert.equal(serviceRequestDetails.body.data.artisanId, null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
