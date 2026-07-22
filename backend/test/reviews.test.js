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
      name: uniqueName('Review Category'),
      description: 'Temporary category for review tests',
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
      experienceYears: 6,
      hourlyRate: 4500,
      city: 'Ouagadougou',
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const createServiceRequest = async (server, customerToken, categoryId, title = 'Review module service request') => {
  const response = await request(server, '/api/service-requests', {
    method: 'POST',
    headers: authHeader(customerToken),
    body: {
      categoryId,
      title,
      description: 'This completed request is used to test review creation.',
      location: 'Ouagadougou',
      budget: 18000,
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const completeServiceRequestThroughAssignment = async (server, adminToken, artisanToken, serviceRequestId, artisanId) => {
  const assignmentResponse = await request(server, '/api/assignments', {
    method: 'POST',
    headers: authHeader(adminToken),
    body: {
      serviceRequestId,
      artisanId,
      message: 'Assignment for review test.',
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
};

test('reviews can be created for completed service requests and listed by participants', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'review-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'review-customer');
    const artisanUser = await registerUser(server, 'ARTISAN', 'review-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);
    const serviceRequest = await createServiceRequest(server, customer.accessToken, category.id);
    await completeServiceRequestThroughAssignment(
      server,
      admin.accessToken,
      artisanUser.accessToken,
      serviceRequest.id,
      artisan.id,
    );

    const createReview = await request(server, '/api/reviews', {
      method: 'POST',
      headers: authHeader(customer.accessToken),
      body: {
        serviceRequestId: serviceRequest.id,
        rating: 5,
        comment: 'Excellent work and clear communication.',
      },
    });
    assert.equal(createReview.statusCode, 201);
    assert.equal(createReview.body.data.rating, 5);
    assert.equal(createReview.body.data.reviewerId, customer.user.id);
    assert.equal(createReview.body.data.revieweeId, artisanUser.user.id);

    const duplicate = await request(server, '/api/reviews', {
      method: 'POST',
      headers: authHeader(customer.accessToken),
      body: {
        serviceRequestId: serviceRequest.id,
        rating: 4,
      },
    });
    assert.equal(duplicate.statusCode, 409);

    const adminList = await request(
      server,
      `/api/reviews?serviceRequest=${serviceRequest.id}&reviewer=${customer.user.id}&reviewee=${artisanUser.user.id}&rating=5&page=1&limit=5`,
      { headers: authHeader(admin.accessToken) },
    );
    assert.equal(adminList.statusCode, 200);
    assert.equal(adminList.body.pagination.page, 1);
    assert.equal(adminList.body.data.length, 1);
    assert.equal(adminList.body.data[0].id, createReview.body.data.id);

    const customerList = await request(server, '/api/reviews', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(customerList.statusCode, 200);
    assert.equal(customerList.body.data.length, 1);

    const artisanList = await request(server, '/api/reviews', {
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(artisanList.statusCode, 200);
    assert.equal(artisanList.body.data.length, 1);

    const details = await request(server, `/api/reviews/${createReview.body.data.id}`, {
      headers: authHeader(artisanUser.accessToken),
    });
    assert.equal(details.statusCode, 200);
    assert.equal(details.body.data.id, createReview.body.data.id);

    const artisans = await request(server, `/api/artisans?category=${encodeURIComponent(category.name)}`, {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(artisans.statusCode, 200);
    const reviewedArtisan = artisans.body.data.find((item) => item.id === artisan.id);
    assert.equal(reviewedArtisan.averageRating, 5);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('review validation and business rules block invalid access and invalid targets', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'review-invalid-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'review-invalid-customer');
    const otherCustomer = await registerUser(server, 'CUSTOMER', 'review-invalid-other-customer');
    const artisanUser = await registerUser(server, 'ARTISAN', 'review-invalid-artisan');
    const category = await createCategory(server, admin.accessToken);
    const artisan = await createArtisanProfile(server, artisanUser.accessToken, category.id);
    const pendingRequest = await createServiceRequest(server, customer.accessToken, category.id, 'Pending review target');

    const invalidId = await request(server, '/api/reviews/not-a-uuid', {
      headers: authHeader(admin.accessToken),
    });
    assert.equal(invalidId.statusCode, 400);

    const artisanCreate = await request(server, '/api/reviews', {
      method: 'POST',
      headers: authHeader(artisanUser.accessToken),
      body: {
        serviceRequestId: pendingRequest.id,
        rating: 5,
      },
    });
    assert.equal(artisanCreate.statusCode, 403);

    const notOwner = await request(server, '/api/reviews', {
      method: 'POST',
      headers: authHeader(otherCustomer.accessToken),
      body: {
        serviceRequestId: pendingRequest.id,
        rating: 5,
      },
    });
    assert.equal(notOwner.statusCode, 403);

    const pendingReview = await request(server, '/api/reviews', {
      method: 'POST',
      headers: authHeader(customer.accessToken),
      body: {
        serviceRequestId: pendingRequest.id,
        rating: 5,
      },
    });
    assert.equal(pendingReview.statusCode, 400);

    await completeServiceRequestThroughAssignment(
      server,
      admin.accessToken,
      artisanUser.accessToken,
      pendingRequest.id,
      artisan.id,
    );

    const invalidRating = await request(server, '/api/reviews', {
      method: 'POST',
      headers: authHeader(customer.accessToken),
      body: {
        serviceRequestId: pendingRequest.id,
        rating: 6,
      },
    });
    assert.equal(invalidRating.statusCode, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
