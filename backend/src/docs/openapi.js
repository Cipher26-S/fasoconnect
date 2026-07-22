const bearerAuth = [{ bearerAuth: [] }];

const success = (schemaRef = '#/components/schemas/SuccessResponse') => ({
  '200': {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: { $ref: schemaRef },
      },
    },
  },
});

const created = (schemaRef = '#/components/schemas/SuccessResponse') => ({
  '201': {
    description: 'Resource created',
    content: {
      'application/json': {
        schema: { $ref: schemaRef },
      },
    },
  },
});

const errors = {
  '400': { $ref: '#/components/responses/BadRequest' },
  '401': { $ref: '#/components/responses/Unauthorized' },
  '403': { $ref: '#/components/responses/Forbidden' },
  '404': { $ref: '#/components/responses/NotFound' },
  '409': { $ref: '#/components/responses/Conflict' },
};

const pageParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, example: 1 },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, example: 10 },
];

const uuidParam = (name, description) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string', format: 'uuid' },
  example: '00000000-0000-4000-8000-000000000000',
});

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'FasoConnect API',
    version: '1.0.0',
    description: 'OpenAPI documentation for the FasoConnect backend API.',
    contact: {
      name: 'FasoConnect',
      email: 'contact@fasoconnect.local',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Backend health checks' },
    { name: 'Authentication', description: 'Registration, login, refresh and session endpoints' },
    { name: 'Users', description: 'Authenticated user profile operations' },
    { name: 'Categories', description: 'Service category catalog' },
    { name: 'Artisans', description: 'Artisan profile management and discovery' },
    { name: 'Service Requests', description: 'Customer service request workflow' },
    { name: 'Assignments', description: 'Assignment workflow between administrators and artisans' },
    { name: 'Reviews', description: 'Customer reviews after completed services' },
    { name: 'Notifications', description: 'User notifications and read state' },
    { name: 'Favorites', description: 'Favorite artisan management' },
    { name: 'Recommendations', description: 'Artisan recommendation engine' },
    { name: 'Dashboard', description: 'Administrator statistics and rankings' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check backend health',
        responses: success('#/components/schemas/HealthResponse'),
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a user',
        requestBody: { $ref: '#/components/requestBodies/RegisterRequest' },
        responses: { ...created('#/components/schemas/AuthResponse'), ...errors },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with email and password',
        requestBody: { $ref: '#/components/requestBodies/LoginRequest' },
        responses: { ...success('#/components/schemas/AuthResponse'), ...errors },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh an access token',
        requestBody: { $ref: '#/components/requestBodies/RefreshRequest' },
        responses: { ...success('#/components/schemas/AuthResponse'), ...errors },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout the authenticated user',
        security: bearerAuth,
        responses: { ...success(), ...errors },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get authenticated user identity',
        security: bearerAuth,
        responses: { ...success('#/components/schemas/UserResponse'), ...errors },
      },
    },
    '/api/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: bearerAuth,
        responses: { ...success('#/components/schemas/UserResponse'), ...errors },
      },
      put: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: bearerAuth,
        requestBody: { $ref: '#/components/requestBodies/UpdateUserProfileRequest' },
        responses: { ...success('#/components/schemas/UserResponse'), ...errors },
      },
    },
    '/api/users/change-password': {
      put: {
        tags: ['Users'],
        summary: 'Change current user password',
        security: bearerAuth,
        requestBody: { $ref: '#/components/requestBodies/ChangePasswordRequest' },
        responses: { ...success(), ...errors },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        responses: success('#/components/schemas/CategoryListResponse'),
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a category',
        description: 'Administrator only.',
        security: bearerAuth,
        requestBody: { $ref: '#/components/requestBodies/CategoryRequest' },
        responses: { ...created('#/components/schemas/CategoryResponse'), ...errors },
      },
    },
    '/api/artisans': {
      get: {
        tags: ['Artisans'],
        summary: 'List artisans',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, example: 'plumber' },
          { name: 'category', in: 'query', schema: { type: 'string' }, example: 'Plumbing' },
          { name: 'city', in: 'query', schema: { type: 'string' }, example: 'Ouagadougou' },
          { name: 'availability', in: 'query', schema: { type: 'boolean' }, example: true },
          { name: 'verified', in: 'query', schema: { type: 'boolean' }, example: true },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'experience', 'rating'] }, example: 'rating' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, example: 'desc' },
          ...pageParams,
        ],
        responses: success('#/components/schemas/ArtisanListResponse'),
      },
    },
    '/api/artisans/profile': {
      get: {
        tags: ['Artisans'],
        summary: 'Get current artisan profile',
        security: bearerAuth,
        responses: { ...success('#/components/schemas/ArtisanResponse'), ...errors },
      },
      post: {
        tags: ['Artisans'],
        summary: 'Create current artisan profile',
        security: bearerAuth,
        requestBody: { $ref: '#/components/requestBodies/ArtisanProfileRequest' },
        responses: { ...created('#/components/schemas/ArtisanResponse'), ...errors },
      },
      put: {
        tags: ['Artisans'],
        summary: 'Update current artisan profile',
        security: bearerAuth,
        requestBody: { $ref: '#/components/requestBodies/ArtisanProfileRequest' },
        responses: { ...success('#/components/schemas/ArtisanResponse'), ...errors },
      },
      delete: {
        tags: ['Artisans'],
        summary: 'Delete current artisan profile',
        security: bearerAuth,
        responses: { ...success(), ...errors },
      },
    },
    '/api/artisans/{id}': {
      get: {
        tags: ['Artisans'],
        summary: 'Get artisan by ID',
        parameters: [uuidParam('id', 'Artisan ID')],
        responses: { ...success('#/components/schemas/ArtisanResponse'), ...errors },
      },
    },
    '/api/artisans/{id}/verify': {
      patch: {
        tags: ['Artisans'],
        summary: 'Verify or unverify an artisan',
        description: 'Administrator only.',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Artisan ID')],
        requestBody: { $ref: '#/components/requestBodies/VerifyArtisanRequest' },
        responses: { ...success('#/components/schemas/ArtisanResponse'), ...errors },
      },
    },
    '/api/service-requests': {
      get: {
        tags: ['Service Requests'],
        summary: 'List scoped service requests',
        security: bearerAuth,
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, example: 'pipe' },
          { name: 'category', in: 'query', schema: { type: 'string' }, example: 'Plumbing' },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/RequestStatus' } },
          { name: 'city', in: 'query', schema: { type: 'string' }, example: 'Ouagadougou' },
          { name: 'customer', in: 'query', schema: { type: 'string' } },
          { name: 'artisan', in: 'query', schema: { type: 'string' } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'scheduledAt', 'status'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ...pageParams,
        ],
        responses: { ...success('#/components/schemas/ServiceRequestListResponse'), ...errors },
      },
      post: {
        tags: ['Service Requests'],
        summary: 'Create a service request',
        security: bearerAuth,
        requestBody: { $ref: '#/components/requestBodies/ServiceRequestCreateRequest' },
        responses: { ...created('#/components/schemas/ServiceRequestResponse'), ...errors },
      },
    },
    '/api/service-requests/{id}': {
      get: {
        tags: ['Service Requests'],
        summary: 'Get service request by ID',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Service request ID')],
        responses: { ...success('#/components/schemas/ServiceRequestResponse'), ...errors },
      },
      put: {
        tags: ['Service Requests'],
        summary: 'Update service request',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Service request ID')],
        requestBody: { $ref: '#/components/requestBodies/ServiceRequestUpdateRequest' },
        responses: { ...success('#/components/schemas/ServiceRequestResponse'), ...errors },
      },
      delete: {
        tags: ['Service Requests'],
        summary: 'Delete service request',
        description: 'Administrator only.',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Service request ID')],
        responses: { ...success(), ...errors },
      },
    },
    '/api/service-requests/{id}/status': {
      patch: {
        tags: ['Service Requests'],
        summary: 'Update service request status',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Service request ID')],
        requestBody: { $ref: '#/components/requestBodies/ServiceRequestStatusRequest' },
        responses: { ...success('#/components/schemas/ServiceRequestResponse'), ...errors },
      },
    },
    '/api/assignments': {
      get: {
        tags: ['Assignments'],
        summary: 'List assignments',
        security: bearerAuth,
        parameters: [
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/AssignmentStatus' } },
          { name: 'artisan', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'serviceRequest', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          ...pageParams,
        ],
        responses: { ...success('#/components/schemas/AssignmentListResponse'), ...errors },
      },
      post: {
        tags: ['Assignments'],
        summary: 'Assign an artisan to a service request',
        description: 'Administrator only.',
        security: bearerAuth,
        requestBody: { $ref: '#/components/requestBodies/AssignmentCreateRequest' },
        responses: { ...created('#/components/schemas/AssignmentResponse'), ...errors },
      },
    },
    '/api/assignments/{id}': {
      get: {
        tags: ['Assignments'],
        summary: 'Get assignment by ID',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Assignment ID')],
        responses: { ...success('#/components/schemas/AssignmentResponse'), ...errors },
      },
    },
    '/api/assignments/{id}/accept': {
      patch: { tags: ['Assignments'], summary: 'Accept assignment', security: bearerAuth, parameters: [uuidParam('id', 'Assignment ID')], responses: { ...success('#/components/schemas/AssignmentResponse'), ...errors } },
    },
    '/api/assignments/{id}/reject': {
      patch: { tags: ['Assignments'], summary: 'Reject assignment', security: bearerAuth, parameters: [uuidParam('id', 'Assignment ID')], responses: { ...success('#/components/schemas/AssignmentResponse'), ...errors } },
    },
    '/api/assignments/{id}/complete': {
      patch: { tags: ['Assignments'], summary: 'Complete assignment', security: bearerAuth, parameters: [uuidParam('id', 'Assignment ID')], responses: { ...success('#/components/schemas/AssignmentResponse'), ...errors } },
    },
    '/api/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List reviews',
        security: bearerAuth,
        parameters: [
          { name: 'serviceRequest', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'reviewer', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'reviewee', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'rating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          ...pageParams,
        ],
        responses: { ...success('#/components/schemas/ReviewListResponse'), ...errors },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create a review for a completed service request',
        security: bearerAuth,
        requestBody: { $ref: '#/components/requestBodies/ReviewCreateRequest' },
        responses: { ...created('#/components/schemas/ReviewResponse'), ...errors },
      },
    },
    '/api/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get review by ID',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Review ID')],
        responses: { ...success('#/components/schemas/ReviewResponse'), ...errors },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List scoped notifications',
        security: bearerAuth,
        parameters: [
          { name: 'user', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Admin filter only' },
          { name: 'isRead', in: 'query', schema: { type: 'boolean' } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          ...pageParams,
        ],
        responses: { ...success('#/components/schemas/NotificationListResponse'), ...errors },
      },
    },
    '/api/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all current user notifications as read',
        security: bearerAuth,
        responses: { ...success(), ...errors },
      },
    },
    '/api/notifications/{id}': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notification by ID',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Notification ID')],
        responses: { ...success('#/components/schemas/NotificationResponse'), ...errors },
      },
    },
    '/api/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark one notification as read',
        security: bearerAuth,
        parameters: [uuidParam('id', 'Notification ID')],
        responses: { ...success('#/components/schemas/NotificationResponse'), ...errors },
      },
    },
    '/api/favorites/artisans': {
      get: {
        tags: ['Favorites'],
        summary: 'List current user favorite artisans',
        security: bearerAuth,
        parameters: pageParams,
        responses: { ...success('#/components/schemas/FavoriteListResponse'), ...errors },
      },
    },
    '/api/favorites/artisans/{artisanId}': {
      post: {
        tags: ['Favorites'],
        summary: 'Add artisan to favorites',
        security: bearerAuth,
        parameters: [uuidParam('artisanId', 'Artisan ID')],
        responses: { ...created('#/components/schemas/FavoriteResponse'), ...errors },
      },
      delete: {
        tags: ['Favorites'],
        summary: 'Remove artisan from favorites',
        security: bearerAuth,
        parameters: [uuidParam('artisanId', 'Artisan ID')],
        responses: { ...success(), ...errors },
      },
    },
    '/api/recommendations/artisans': {
      get: {
        tags: ['Recommendations'],
        summary: 'Recommend artisans by category, request, location and score',
        security: bearerAuth,
        parameters: [
          { name: 'serviceRequestId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'category', in: 'query', schema: { type: 'string' }, example: 'Plumbing' },
          { name: 'city', in: 'query', schema: { type: 'string' }, example: 'Ouagadougou' },
          { name: 'latitude', in: 'query', schema: { type: 'number' }, example: 12.3714 },
          { name: 'longitude', in: 'query', schema: { type: 'number' }, example: -1.5197 },
          { name: 'maxDistanceKm', in: 'query', schema: { type: 'number', maximum: 500 }, example: 50 },
          { name: 'budget', in: 'query', schema: { type: 'number' }, example: 20000 },
          { name: 'availabilityOnly', in: 'query', schema: { type: 'boolean', default: true } },
          { name: 'verifiedOnly', in: 'query', schema: { type: 'boolean', default: false } },
          { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 50, default: 10 } },
        ],
        responses: { ...success('#/components/schemas/RecommendationResponse'), ...errors },
      },
    },
    '/api/dashboard/summary': { get: { tags: ['Dashboard'], summary: 'Get dashboard summary', security: bearerAuth, responses: { ...success('#/components/schemas/DashboardSummaryResponse'), ...errors } } },
    '/api/dashboard/users': { get: { tags: ['Dashboard'], summary: 'Get user statistics', security: bearerAuth, responses: { ...success('#/components/schemas/DashboardStatsResponse'), ...errors } } },
    '/api/dashboard/artisans': { get: { tags: ['Dashboard'], summary: 'Get artisan statistics', security: bearerAuth, responses: { ...success('#/components/schemas/DashboardStatsResponse'), ...errors } } },
    '/api/dashboard/categories': { get: { tags: ['Dashboard'], summary: 'Get category statistics', security: bearerAuth, responses: { ...success('#/components/schemas/DashboardStatsResponse'), ...errors } } },
    '/api/dashboard/service-requests': { get: { tags: ['Dashboard'], summary: 'Get service request statistics', security: bearerAuth, responses: { ...success('#/components/schemas/DashboardStatsResponse'), ...errors } } },
    '/api/dashboard/assignments': { get: { tags: ['Dashboard'], summary: 'Get assignment statistics', security: bearerAuth, responses: { ...success('#/components/schemas/DashboardStatsResponse'), ...errors } } },
    '/api/dashboard/reviews': { get: { tags: ['Dashboard'], summary: 'Get review statistics', security: bearerAuth, responses: { ...success('#/components/schemas/DashboardStatsResponse'), ...errors } } },
    '/api/dashboard/notifications': { get: { tags: ['Dashboard'], summary: 'Get notification statistics', security: bearerAuth, responses: { ...success('#/components/schemas/DashboardStatsResponse'), ...errors } } },
    '/api/dashboard/monthly': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get monthly user and service request evolution',
        security: bearerAuth,
        parameters: [{ name: 'months', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 36, default: 12 } }],
        responses: { ...success('#/components/schemas/DashboardMonthlyResponse'), ...errors },
      },
    },
    '/api/dashboard/top-artisans': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get top artisans ranking',
        security: bearerAuth,
        parameters: pageParams,
        responses: { ...success('#/components/schemas/TopArtisansResponse'), ...errors },
      },
    },
    '/api/dashboard/top-categories': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get top categories ranking',
        security: bearerAuth,
        parameters: pageParams,
        responses: { ...success('#/components/schemas/TopCategoriesResponse'), ...errors },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Use the access token returned by /api/auth/login or /api/auth/register.',
      },
    },
    responses: {
      BadRequest: { description: 'Invalid request data', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'Invalid request data' } } } },
      Unauthorized: { description: 'Authentication token missing or invalid', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'Authentication token is required' } } } },
      Forbidden: { description: 'Authenticated user is not allowed to perform this action', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'You do not have permission to perform this action' } } } },
      NotFound: { description: 'Resource not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'Resource not found' } } } },
      Conflict: { description: 'Business conflict or duplicate resource', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, message: 'Resource already exists' } } } },
    },
    requestBodies: {
      RegisterRequest: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' }, example: { fullName: 'Awa Ouedraogo', email: 'awa@example.com', password: 'StrongPass123', role: 'CUSTOMER' } } },
      },
      LoginRequest: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' }, example: { email: 'awa@example.com', password: 'StrongPass123' } } },
      },
      RefreshRequest: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } }, example: { refreshToken: 'jwt.refresh.token' } } },
      },
      UpdateUserProfileRequest: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserProfileInput' }, example: { fullName: 'Awa Ouedraogo', phone: '+22670000000', city: 'Ouagadougou', country: 'Burkina Faso' } } },
      },
      ChangePasswordRequest: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 6 } } }, example: { currentPassword: 'StrongPass123', newPassword: 'NewStrongPass123' } } },
      },
      CategoryRequest: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' }, example: { name: 'Plomberie', description: 'Services de plomberie', image: 'https://example.com/plumbing.jpg' } } },
      },
      ArtisanProfileRequest: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ArtisanProfileInput' },
            example: { categoryId: '00000000-0000-4000-8000-000000000000', experienceYears: 5, hourlyRate: 5000, city: 'Ouagadougou', availability: true },
          },
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/ArtisanProfileInput' },
          },
        },
      },
      VerifyArtisanRequest: {
        required: false,
        content: { 'application/json': { schema: { type: 'object', properties: { verified: { type: 'boolean', default: true } } }, example: { verified: true } } },
      },
      ServiceRequestCreateRequest: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ServiceRequestCreateInput' }, example: { categoryId: '00000000-0000-4000-8000-000000000000', title: 'Repair kitchen pipe', description: 'The kitchen pipe is leaking.', location: 'Ouagadougou', budget: 20000 } },
          'multipart/form-data': { schema: { $ref: '#/components/schemas/ServiceRequestCreateInput' } },
        },
      },
      ServiceRequestUpdateRequest: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceRequestUpdateInput' }, example: { title: 'Updated title', budget: 25000 } } },
      },
      ServiceRequestStatusRequest: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { $ref: '#/components/schemas/RequestStatus' } } }, example: { status: 'IN_PROGRESS' } } },
      },
      AssignmentCreateRequest: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignmentCreateInput' }, example: { serviceRequestId: '00000000-0000-4000-8000-000000000000', artisanId: '00000000-0000-4000-8000-000000000000', message: 'Please handle this request.' } } },
      },
      ReviewCreateRequest: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewCreateInput' }, example: { serviceRequestId: '00000000-0000-4000-8000-000000000000', rating: 5, comment: 'Excellent service.' } } },
      },
    },
    schemas: {
      UserRole: { type: 'string', enum: ['ADMIN', 'CUSTOMER', 'ARTISAN'] },
      UserStatus: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] },
      RequestStatus: { type: 'string', enum: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
      AssignmentStatus: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'] },
      Pagination: { type: 'object', properties: { page: { type: 'integer' }, limit: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' } } },
      SuccessResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Operation successful' }, data: { type: 'object', additionalProperties: true } } },
      ErrorResponse: { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string' } } },
      HealthResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'FasoConnect backend is running' } } },
      RegisterInput: { type: 'object', required: ['fullName', 'email', 'password'], properties: { fullName: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 }, role: { $ref: '#/components/schemas/UserRole' } } },
      LoginInput: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } },
      UpdateUserProfileInput: { type: 'object', properties: { fullName: { type: 'string' }, phone: { type: 'string' }, bio: { type: 'string' }, city: { type: 'string' }, country: { type: 'string' }, profilePicture: { type: 'string' } } },
      CategoryInput: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' }, image: { type: 'string' } } },
      ArtisanProfileInput: { type: 'object', properties: { categoryId: { type: 'string', format: 'uuid' }, experienceYears: { type: 'integer' }, hourlyRate: { type: 'number' }, latitude: { type: 'number' }, longitude: { type: 'number' }, availability: { type: 'boolean' }, city: { type: 'string' }, country: { type: 'string' }, profilePicture: { type: 'string', format: 'binary' } } },
      ServiceRequestCreateInput: { type: 'object', required: ['categoryId', 'title', 'description'], properties: { customerId: { type: 'string', format: 'uuid' }, categoryId: { type: 'string', format: 'uuid' }, artisanId: { type: 'string', format: 'uuid' }, title: { type: 'string' }, description: { type: 'string' }, location: { type: 'string' }, latitude: { type: 'number' }, longitude: { type: 'number' }, budget: { type: 'number' }, scheduledAt: { type: 'string', format: 'date-time' }, images: { type: 'array', items: { type: 'string', format: 'binary' } } } },
      ServiceRequestUpdateInput: { type: 'object', properties: { categoryId: { type: 'string', format: 'uuid' }, artisanId: { type: 'string', format: 'uuid', nullable: true }, title: { type: 'string' }, description: { type: 'string' }, location: { type: 'string', nullable: true }, latitude: { type: 'number', nullable: true }, longitude: { type: 'number', nullable: true }, budget: { type: 'number', nullable: true }, scheduledAt: { type: 'string', format: 'date-time', nullable: true }, status: { $ref: '#/components/schemas/RequestStatus' }, images: { type: 'array', items: { type: 'string', format: 'binary' } } } },
      AssignmentCreateInput: { type: 'object', required: ['serviceRequestId', 'artisanId'], properties: { serviceRequestId: { type: 'string', format: 'uuid' }, artisanId: { type: 'string', format: 'uuid' }, message: { type: 'string', maxLength: 500 } } },
      ReviewCreateInput: { type: 'object', required: ['serviceRequestId', 'rating'], properties: { serviceRequestId: { type: 'string', format: 'uuid' }, rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string' } } },
      User: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, fullName: { type: 'string' }, email: { type: 'string' }, role: { $ref: '#/components/schemas/UserRole' }, status: { $ref: '#/components/schemas/UserStatus' }, phone: { type: 'string', nullable: true }, city: { type: 'string', nullable: true }, country: { type: 'string', nullable: true } } },
      Category: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'string' }, description: { type: 'string', nullable: true }, image: { type: 'string', nullable: true } } },
      Artisan: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, userId: { type: 'string', format: 'uuid' }, categoryId: { type: 'string', format: 'uuid' }, experienceYears: { type: 'integer' }, hourlyRate: { type: 'number', nullable: true }, availability: { type: 'boolean' }, verified: { type: 'boolean' }, averageRating: { type: 'number', nullable: true }, user: { $ref: '#/components/schemas/User' }, category: { $ref: '#/components/schemas/Category' } } },
      ServiceRequest: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, customerId: { type: 'string', format: 'uuid' }, artisanId: { type: 'string', format: 'uuid', nullable: true }, categoryId: { type: 'string', format: 'uuid' }, title: { type: 'string' }, description: { type: 'string' }, status: { $ref: '#/components/schemas/RequestStatus' }, budget: { type: 'number', nullable: true } } },
      Assignment: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, serviceRequestId: { type: 'string', format: 'uuid' }, artisanId: { type: 'string', format: 'uuid' }, assignedBy: { type: 'string', format: 'uuid' }, status: { $ref: '#/components/schemas/AssignmentStatus' }, message: { type: 'string', nullable: true } } },
      Review: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, serviceRequestId: { type: 'string', format: 'uuid' }, reviewerId: { type: 'string', format: 'uuid' }, revieweeId: { type: 'string', format: 'uuid' }, rating: { type: 'integer' }, comment: { type: 'string', nullable: true } } },
      Notification: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, userId: { type: 'string', format: 'uuid' }, title: { type: 'string' }, message: { type: 'string' }, isRead: { type: 'boolean' } } },
      Favorite: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, userId: { type: 'string', format: 'uuid' }, artisanId: { type: 'string', format: 'uuid' }, artisan: { $ref: '#/components/schemas/Artisan' } } },
      AuthResponse: { type: 'object', properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' }, accessToken: { type: 'string' }, refreshToken: { type: 'string' } } },
      UserResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } },
      CategoryResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Category' } } },
      CategoryListResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } },
      ArtisanResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Artisan' } } },
      ArtisanListResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Artisan' } }, pagination: { $ref: '#/components/schemas/Pagination' } } },
      ServiceRequestResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ServiceRequest' } } },
      ServiceRequestListResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/ServiceRequest' } }, pagination: { $ref: '#/components/schemas/Pagination' } } },
      AssignmentResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Assignment' } } },
      AssignmentListResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Assignment' } }, pagination: { $ref: '#/components/schemas/Pagination' } } },
      ReviewResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Review' } } },
      ReviewListResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Review' } }, pagination: { $ref: '#/components/schemas/Pagination' } } },
      NotificationResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Notification' } } },
      NotificationListResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } }, unreadCount: { type: 'integer' }, pagination: { $ref: '#/components/schemas/Pagination' } } },
      FavoriteResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Favorite' } } },
      FavoriteListResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Favorite' } }, pagination: { $ref: '#/components/schemas/Pagination' } } },
      RecommendationResponse: { type: 'object', properties: { success: { type: 'boolean' }, context: { type: 'object', additionalProperties: true }, data: { type: 'array', items: { allOf: [{ $ref: '#/components/schemas/Artisan' }, { type: 'object', properties: { recommendation: { type: 'object', additionalProperties: true } } }] } } } },
      DashboardSummaryResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { totals: { type: 'object', additionalProperties: true }, performance: { type: 'object', additionalProperties: true } } } } },
      DashboardStatsResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', additionalProperties: true } } },
      DashboardMonthlyResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { userRegistrations: { type: 'array', items: { type: 'object', properties: { month: { type: 'string' }, count: { type: 'integer' } } } }, serviceRequests: { type: 'array', items: { type: 'object', properties: { month: { type: 'string' }, count: { type: 'integer' } } } } } } } },
      TopArtisansResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { type: 'object', additionalProperties: true } }, pagination: { $ref: '#/components/schemas/Pagination' } } },
      TopCategoriesResponse: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { type: 'object', additionalProperties: true } }, pagination: { $ref: '#/components/schemas/Pagination' } } },
    },
  },
};

export default openApiSpec;
