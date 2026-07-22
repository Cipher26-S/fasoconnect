import { v2 as cloudinary } from 'cloudinary';
import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const requestInclude = {
  customer: { select: { id: true, fullName: true, email: true, phone: true, city: true, country: true } },
  category: true,
  artisan: { include: { user: { select: { id: true, fullName: true, email: true, phone: true, city: true, country: true } } } },
  images: true,
};

const artisanWorkflow = {
  ASSIGNED: ['ACCEPTED'],
  ACCEPTED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
};

const customerCancellableStatuses = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'];

const getArtisanProfileForUser = async (user) => {
  if (user.role !== 'ARTISAN') {
    return null;
  }

  return prisma.artisan.findUnique({ where: { userId: user.id } });
};

const ensureCloudinaryConfigured = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary is not configured', 500);
  }
};

export const uploadServiceRequestImages = async (files = []) => {
  if (!files.length) {
    return [];
  }

  ensureCloudinaryConfigured();

  const uploads = files.map((file) => {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    return cloudinary.uploader.upload(base64, {
      folder: 'fasoconnect/service-requests',
      resource_type: 'image',
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    });
  });

  const results = await Promise.all(uploads);
  return results.map((result) => result.secure_url);
};

const normalizeRequestPayload = (data) => {
  const payload = { ...data };

  if (data.budget !== undefined) {
    payload.budget = data.budget === null ? null : data.budget.toString();
  }

  if (data.scheduledAt !== undefined) {
    payload.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
  }

  return payload;
};

const getScopedRequest = async (id, user) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id },
    include: requestInclude,
  });

  if (!request) {
    throw new AppError('Service request not found', 404);
  }

  if (user.role === 'ADMIN' || request.customerId === user.id) {
    return request;
  }

  const artisan = await getArtisanProfileForUser(user);
  if (artisan && request.artisanId === artisan.id) {
    return request;
  }

  throw new AppError('You do not have permission to access this service request', 403);
};

const assertUpdateAllowed = (request, user, payload) => {
  if (user.role === 'ADMIN') {
    return;
  }

  if (user.role !== 'CUSTOMER' || request.customerId !== user.id) {
    throw new AppError('You do not have permission to update this service request', 403);
  }

  if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
    throw new AppError('Completed or cancelled requests cannot be updated', 400);
  }

  const attemptedAdminFields = ['artisanId'].some((field) => payload[field] !== undefined);
  if (attemptedAdminFields) {
    throw new AppError('Only an administrator can assign artisans', 403);
  }

  if (payload.status && payload.status !== 'CANCELLED') {
    throw new AppError('Customers can only cancel their own service requests', 403);
  }
};

const assertStatusChangeAllowed = async (request, user, nextStatus) => {
  if (request.status === nextStatus) {
    return;
  }

  if (user.role === 'ADMIN') {
    return;
  }

  if (user.role === 'CUSTOMER' && request.customerId === user.id) {
    if (nextStatus !== 'CANCELLED') {
      throw new AppError('Customers can only cancel their own service requests', 403);
    }

    if (!customerCancellableStatuses.includes(request.status)) {
      throw new AppError('This service request can no longer be cancelled', 400);
    }

    return;
  }

  const artisan = await getArtisanProfileForUser(user);
  if (!artisan || request.artisanId !== artisan.id) {
    throw new AppError('You do not have permission to update this service request status', 403);
  }

  const allowedStatuses = artisanWorkflow[request.status] || [];
  if (!allowedStatuses.includes(nextStatus)) {
    throw new AppError(`Cannot change status from ${request.status} to ${nextStatus}`, 400);
  }
};

const buildSearchFilters = (search) => {
  if (!search) {
    return [];
  }

  return [
    { title: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
    { category: { name: { contains: search, mode: 'insensitive' } } },
    { customer: { fullName: { contains: search, mode: 'insensitive' } } },
    { customer: { email: { contains: search, mode: 'insensitive' } } },
    { artisan: { user: { fullName: { contains: search, mode: 'insensitive' } } } },
    { artisan: { user: { email: { contains: search, mode: 'insensitive' } } } },
  ];
};

const buildWhereClause = async (query, user) => {
  const where = {};
  const andFilters = [];

  if (user.role === 'CUSTOMER') {
    andFilters.push({ customerId: user.id });
  }

  if (user.role === 'ARTISAN') {
    const artisan = await getArtisanProfileForUser(user);
    andFilters.push({ artisanId: artisan?.id || '__no_artisan_profile__' });
  }

  const searchFilters = buildSearchFilters(query.search);
  if (searchFilters.length) {
    andFilters.push({ OR: searchFilters });
  }

  if (query.category) {
    andFilters.push({
      OR: [
        { categoryId: query.category },
        { category: { name: { contains: query.category, mode: 'insensitive' } } },
      ],
    });
  }

  if (query.status) {
    andFilters.push({ status: query.status });
  }

  if (query.city) {
    andFilters.push({
      OR: [
        { location: { contains: query.city, mode: 'insensitive' } },
        { customer: { city: { contains: query.city, mode: 'insensitive' } } },
        { artisan: { user: { city: { contains: query.city, mode: 'insensitive' } } } },
      ],
    });
  }

  if (query.customer) {
    andFilters.push({
      OR: [
        { customerId: query.customer },
        { customer: { fullName: { contains: query.customer, mode: 'insensitive' } } },
        { customer: { email: { contains: query.customer, mode: 'insensitive' } } },
      ],
    });
  }

  if (query.artisan) {
    andFilters.push({
      OR: [
        { artisanId: query.artisan },
        { artisan: { user: { fullName: { contains: query.artisan, mode: 'insensitive' } } } },
        { artisan: { user: { email: { contains: query.artisan, mode: 'insensitive' } } } },
      ],
    });
  }

  if (query.date) {
    const from = new Date(`${query.date}T00:00:00.000Z`);
    const to = new Date(`${query.date}T23:59:59.999Z`);
    andFilters.push({ createdAt: { gte: from, lte: to } });
  }

  if (andFilters.length) {
    where.AND = andFilters;
  }

  return where;
};

export const createServiceRequestService = async (user, data, imageUrls = []) => {
  if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN') {
    throw new AppError('Only customers can create service requests', 403);
  }

  const payload = normalizeRequestPayload(data);
  const customerId = user.role === 'ADMIN' ? (payload.customerId || user.id) : user.id;

  if (user.role === 'CUSTOMER') {
    delete payload.customerId;
    delete payload.artisanId;
  }

  if (payload.artisanId) {
    payload.status = 'ASSIGNED';
  }

  delete payload.customerId;

  try {
    return await prisma.serviceRequest.create({
      data: {
        ...payload,
        customerId,
        images: {
          create: imageUrls.map((imageUrl) => ({ imageUrl })),
        },
      },
      include: requestInclude,
    });
  } catch (error) {
    if (error?.code === 'P2003') {
      throw new AppError('Invalid customer, category or artisan reference', 400);
    }
    throw error;
  }
};

export const listServiceRequestsService = async (query, user) => {
  const where = await buildWhereClause(query, user);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [requests, total] = await prisma.$transaction([
    prisma.serviceRequest.findMany({
      where,
      include: requestInclude,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip,
      take: limit,
    }),
    prisma.serviceRequest.count({ where }),
  ]);

  return {
    data: requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getServiceRequestByIdService = async (id, user) => getScopedRequest(id, user);

export const updateServiceRequestService = async (id, user, data, imageUrls = []) => {
  const request = await getScopedRequest(id, user);
  const payload = normalizeRequestPayload(data);

  assertUpdateAllowed(request, user, payload);

  if (payload.status) {
    await assertStatusChangeAllowed(request, user, payload.status);
  }

  if (payload.artisanId && !payload.status) {
    payload.status = 'ASSIGNED';
  }

  if (payload.artisanId === null && !payload.status) {
    payload.status = 'PENDING';
  }

  try {
    return await prisma.serviceRequest.update({
      where: { id },
      data: {
        ...payload,
        ...(imageUrls.length
          ? { images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) } }
          : {}),
      },
      include: requestInclude,
    });
  } catch (error) {
    if (error?.code === 'P2003') {
      throw new AppError('Invalid category or artisan reference', 400);
    }
    throw error;
  }
};

export const updateServiceRequestStatusService = async (id, user, status) => {
  const request = await getScopedRequest(id, user);
  await assertStatusChangeAllowed(request, user, status);

  return prisma.serviceRequest.update({
    where: { id },
    data: { status },
    include: requestInclude,
  });
};

export const deleteServiceRequestService = async (id, user) => {
  await getScopedRequest(id, user);

  if (user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to delete this service request', 403);
  }

  await prisma.serviceRequest.delete({ where: { id } });
};
