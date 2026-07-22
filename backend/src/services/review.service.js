import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';

const reviewInclude = {
  serviceRequest: {
    select: {
      id: true,
      title: true,
      status: true,
      customerId: true,
      artisanId: true,
    },
  },
  reviewer: { select: { id: true, fullName: true, email: true, role: true, city: true, country: true } },
  reviewee: { select: { id: true, fullName: true, email: true, role: true, city: true, country: true } },
};

const getArtisanProfileForUser = async (user) => {
  if (user.role !== 'ARTISAN') {
    return null;
  }

  return prisma.artisan.findUnique({ where: { userId: user.id } });
};

const getScopedReview = async (id, user) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: reviewInclude,
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (user.role === 'ADMIN' || review.reviewerId === user.id || review.revieweeId === user.id) {
    return review;
  }

  throw new AppError('You do not have permission to access this review', 403);
};

const buildWhereClause = async (query, user) => {
  const andFilters = [];

  if (user.role === 'CUSTOMER') {
    andFilters.push({
      OR: [
        { reviewerId: user.id },
        { revieweeId: user.id },
      ],
    });
  } else if (user.role === 'ARTISAN') {
    const artisan = await getArtisanProfileForUser(user);
    andFilters.push({
      OR: [
        { reviewerId: user.id },
        { revieweeId: user.id },
        { serviceRequest: { artisanId: artisan?.id || '__no_artisan_profile__' } },
      ],
    });
  } else if (user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to access reviews', 403);
  }

  if (query.serviceRequest) {
    andFilters.push({ serviceRequestId: query.serviceRequest });
  }

  if (query.reviewer) {
    andFilters.push({ reviewerId: query.reviewer });
  }

  if (query.reviewee) {
    andFilters.push({ revieweeId: query.reviewee });
  }

  if (query.rating) {
    andFilters.push({ rating: query.rating });
  }

  if (query.date) {
    const from = new Date(`${query.date}T00:00:00.000Z`);
    const to = new Date(`${query.date}T23:59:59.999Z`);
    andFilters.push({ createdAt: { gte: from, lte: to } });
  }

  return andFilters.length ? { AND: andFilters } : {};
};

export const createReviewService = async (user, data) => {
  if (user.role !== 'CUSTOMER') {
    throw new AppError('Only customers can review completed service requests', 403);
  }

  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id: data.serviceRequestId },
    include: {
      artisan: {
        include: {
          user: { select: { id: true } },
        },
      },
    },
  });

  if (!serviceRequest) {
    throw new AppError('Service request not found', 404);
  }

  if (serviceRequest.customerId !== user.id) {
    throw new AppError('You can only review your own service requests', 403);
  }

  if (serviceRequest.status !== 'COMPLETED') {
    throw new AppError('Only completed service requests can be reviewed', 400);
  }

  if (!serviceRequest.artisan?.user?.id) {
    throw new AppError('This service request has no artisan to review', 400);
  }

  try {
    return await prisma.review.create({
      data: {
        serviceRequestId: data.serviceRequestId,
        reviewerId: user.id,
        revieweeId: serviceRequest.artisan.user.id,
        rating: data.rating,
        comment: data.comment,
      },
      include: reviewInclude,
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      throw new AppError('You have already reviewed this service request', 409);
    }
    if (error?.code === 'P2003') {
      throw new AppError('Invalid service request or user reference', 400);
    }
    throw error;
  }
};

export const listReviewsService = async (query, user) => {
  const where = await buildWhereClause(query, user);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getReviewByIdService = async (id, user) => getScopedReview(id, user);
