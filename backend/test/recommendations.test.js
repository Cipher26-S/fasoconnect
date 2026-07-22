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

const createCategory = async (server, adminToken, namePrefix = 'Recommendation Category') => {
  const response = await request(server, '/api/categories', {
    method: 'POST',
    headers: authHeader(adminToken),
    body: {
      name: uniqueName(namePrefix),
      description: 'Temporary category for recommendation tests',
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const createArtisanProfile = async (server, artisanToken, categoryId, overrides = {}) => {
  const response = await request(server, '/api/artisans/profile', {
    method: 'POST',
    headers: authHeader(artisanToken),
    body: {
      categoryId,
      experienceYears: 3,
      hourlyRate: 5000,
      city: 'Ouagadougou',
      latitude: 12.3714,
      longitude: -1.5197,
      ...overrides,
    },
  });

  assert.equal(response.statusCode, 201);
  return response.body.data;
};

const createServiceRequest = async (server, customerToken, categoryId, title = 'Recommendation service request') => {
  const response = await request(server, '/api/service-requests', {
    method: 'POST',
    headers: authHeader(customerToken),
    body: {
      categoryId,
      title,
      description: 'This request is used to test artisan recommendations.',
      location: 'Ouagadougou',
      latitude: 12.3714,
      longitude: -1.5197,
      budget: 20000,
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
      message: 'Assignment for recommendation scoring.',
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

test('recommendation engine ranks artisans by category, location, reviews and business score', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'recommendation-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'recommendation-customer');
    const preferredArtisanUser = await registerUser(server, 'ARTISAN', 'recommendation-preferred-artisan');
    const otherArtisanUser = await registerUser(server, 'ARTISAN', 'recommendation-other-artisan');
    const category = await createCategory(server, admin.accessToken);
    const otherCategory = await createCategory(server, admin.accessToken, 'Recommendation Other Category');
    const preferredArtisan = await createArtisanProfile(server, preferredArtisanUser.accessToken, category.id, {
      experienceYears: 8,
      hourlyRate: 4500,
      city: 'Ouagadougou',
      latitude: 12.3714,
      longitude: -1.5197,
    });
    const otherArtisan = await createArtisanProfile(server, otherArtisanUser.accessToken, category.id, {
      experienceYears: 1,
      hourlyRate: 9000,
      city: 'Bobo-Dioulasso',
      latitude: 11.1771,
      longitude: -4.2979,
    });

    const unrelatedUser = await registerUser(server, 'ARTISAN', 'recommendation-unrelated-artisan');
    await createArtisanProfile(server, unrelatedUser.accessToken, otherCategory.id, {
      experienceYears: 10,
      city: 'Ouagadougou',
    });

    const verifyResponse = await request(server, `/api/artisans/${preferredArtisan.id}/verify`, {
      method: 'PATCH',
      headers: authHeader(admin.accessToken),
      body: { verified: true },
    });
    assert.equal(verifyResponse.statusCode, 200);

    const completedRequest = await createServiceRequest(
      server,
      customer.accessToken,
      category.id,
      'Completed request for recommendation score',
    );
    await completeServiceRequestThroughAssignment(
      server,
      admin.accessToken,
      preferredArtisanUser.accessToken,
      completedRequest.id,
      preferredArtisan.id,
    );

    const reviewResponse = await request(server, '/api/reviews', {
      method: 'POST',
      headers: authHeader(customer.accessToken),
      body: {
        serviceRequestId: completedRequest.id,
        rating: 5,
        comment: 'Excellent recommendation signal.',
      },
    });
    assert.equal(reviewResponse.statusCode, 201);

    const recommendationRequest = await createServiceRequest(
      server,
      customer.accessToken,
      category.id,
      'Pending request needing recommendations',
    );

    const recommendations = await request(
      server,
      `/api/recommendations/artisans?serviceRequestId=${recommendationRequest.id}&limit=5&maxDistanceKm=500`,
      { headers: authHeader(customer.accessToken) },
    );
    assert.equal(recommendations.statusCode, 200);
    assert.equal(recommendations.body.context.serviceRequestId, recommendationRequest.id);
    assert.equal(recommendations.body.context.categoryId, category.id);
    assert.equal(recommendations.body.data.length, 2);
    assert.equal(recommendations.body.data[0].id, preferredArtisan.id);
    assert.equal(recommendations.body.data[0].averageRating, 5);
    assert.equal(recommendations.body.data[0].completedRequestsCount, 1);
    assert.ok(recommendations.body.data[0].recommendation.score > recommendations.body.data[1].recommendation.score);
    assert.equal(recommendations.body.data[1].id, otherArtisan.id);

    const verifiedOnly = await request(
      server,
      `/api/recommendations/artisans?categoryId=${category.id}&verifiedOnly=true`,
      { headers: authHeader(admin.accessToken) },
    );
    assert.equal(verifiedOnly.statusCode, 200);
    assert.equal(verifiedOnly.body.data.length, 1);
    assert.equal(verifiedOnly.body.data[0].id, preferredArtisan.id);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('recommendation validation and service request scoping are enforced', async () => {
  const server = app.listen(0);

  try {
    const admin = await registerUser(server, 'ADMIN', 'recommendation-invalid-admin');
    const customer = await registerUser(server, 'CUSTOMER', 'recommendation-invalid-customer');
    const otherCustomer = await registerUser(server, 'CUSTOMER', 'recommendation-invalid-other');
    const category = await createCategory(server, admin.accessToken);
    const serviceRequest = await createServiceRequest(server, customer.accessToken, category.id);

    const missingContext = await request(server, '/api/recommendations/artisans', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(missingContext.statusCode, 400);

    const invalidUuid = await request(server, '/api/recommendations/artisans?serviceRequestId=not-a-uuid', {
      headers: authHeader(customer.accessToken),
    });
    assert.equal(invalidUuid.statusCode, 400);

    const forbiddenRequest = await request(
      server,
      `/api/recommendations/artisans?serviceRequestId=${serviceRequest.id}`,
      { headers: authHeader(otherCustomer.accessToken) },
    );
    assert.equal(forbiddenRequest.statusCode, 403);

    const invalidBoolean = await request(
      server,
      `/api/recommendations/artisans?categoryId=${category.id}&verifiedOnly=maybe`,
      { headers: authHeader(admin.accessToken) },
    );
    assert.equal(invalidBoolean.statusCode, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
