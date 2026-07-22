import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  profilePicture: true,
  phone: true,
  bio: true,
  city: true,
  country: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const recommendationInclude = {
  user: { select: userSelect },
  category: true,
  requests: {
    select: {
      id: true,
      status: true,
      reviews: { select: { rating: true } },
    },
  },
};

const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

const normalizeText = (value) => (value || '').trim().toLowerCase();

const getAverageRating = (artisan) => {
  const reviews = (artisan.requests || []).flatMap((request) => request.reviews || []);

  if (!reviews.length) {
    return null;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

const getCompletedRequestsCount = (artisan) => (
  artisan.requests || []
).filter((request) => request.status === 'COMPLETED').length;

const calculateDistanceKm = (fromLatitude, fromLongitude, toLatitude, toLongitude) => {
  if (
    fromLatitude === undefined
    || fromLongitude === undefined
    || toLatitude === null
    || toLongitude === null
  ) {
    return null;
  }

  const earthRadiusKm = 6371;
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const deltaLatitude = toRadians(toLatitude - fromLatitude);
  const deltaLongitude = toRadians(toLongitude - fromLongitude);
  const startLatitude = toRadians(fromLatitude);
  const endLatitude = toRadians(toLatitude);

  const haversine = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return Number((earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))).toFixed(2));
};

const getScopedServiceRequest = async (id, user) => {
  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      category: true,
      artisan: true,
    },
  });

  if (!serviceRequest) {
    throw new AppError('Service request not found', 404);
  }

  if (user.role === 'ADMIN' || serviceRequest.customerId === user.id) {
    return serviceRequest;
  }

  throw new AppError('You do not have permission to use this service request for recommendations', 403);
};

const buildRecommendationContext = async (query, user) => {
  if (!query.serviceRequestId) {
    return {
      categoryId: query.categoryId,
      category: query.category,
      city: query.city,
      latitude: query.latitude,
      longitude: query.longitude,
      budget: query.budget,
      excludedArtisanId: null,
    };
  }

  const serviceRequest = await getScopedServiceRequest(query.serviceRequestId, user);

  return {
    categoryId: query.categoryId || serviceRequest.categoryId,
    category: query.category || serviceRequest.category?.name,
    city: query.city || serviceRequest.location,
    latitude: query.latitude ?? serviceRequest.latitude ?? undefined,
    longitude: query.longitude ?? serviceRequest.longitude ?? undefined,
    budget: query.budget ?? toNumber(serviceRequest.budget) ?? undefined,
    excludedArtisanId: serviceRequest.artisanId,
    serviceRequest,
  };
};

const buildWhereClause = (query, context) => {
  const andFilters = [];

  if (context.categoryId) {
    andFilters.push({ categoryId: context.categoryId });
  } else if (context.category) {
    andFilters.push({ category: { name: { contains: context.category, mode: 'insensitive' } } });
  }

  if (query.availabilityOnly) {
    andFilters.push({ availability: true });
  }

  if (query.verifiedOnly) {
    andFilters.push({ verified: true });
  }

  if (context.excludedArtisanId) {
    andFilters.push({ id: { not: context.excludedArtisanId } });
  }

  return andFilters.length ? { AND: andFilters } : {};
};

const calculateScore = (artisan, context, query) => {
  const averageRating = getAverageRating(artisan);
  const completedRequestsCount = getCompletedRequestsCount(artisan);
  const distanceKm = calculateDistanceKm(
    context.latitude,
    context.longitude,
    artisan.latitude,
    artisan.longitude,
  );
  const artisanCity = normalizeText(artisan.user?.city);
  const contextCity = normalizeText(context.city);
  const sameCity = artisanCity && contextCity
    ? artisanCity.includes(contextCity) || contextCity.includes(artisanCity)
    : false;
  const hourlyRate = toNumber(artisan.hourlyRate);

  const scoreBreakdown = {
    category: 40,
    availability: artisan.availability ? 15 : 0,
    verified: artisan.verified ? 10 : 0,
    location: 0,
    rating: averageRating ? Number(((averageRating / 5) * 15).toFixed(2)) : 0,
    popularity: Math.min(completedRequestsCount * 2, 10),
    experience: Math.min(artisan.experienceYears, 10) * 0.5,
    budgetFit: 0,
  };

  if (distanceKm !== null) {
    const maxDistance = query.maxDistanceKm || 50;
    scoreBreakdown.location = distanceKm <= maxDistance
      ? Number((15 * (1 - (distanceKm / maxDistance))).toFixed(2))
      : 0;
  } else if (sameCity) {
    scoreBreakdown.location = 10;
  }

  if (context.budget && hourlyRate) {
    scoreBreakdown.budgetFit = hourlyRate <= context.budget ? 5 : 0;
  }

  const score = Number(Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0).toFixed(2));

  return {
    averageRating,
    completedRequestsCount,
    distanceKm,
    score,
    scoreBreakdown,
  };
};

export const recommendArtisansService = async (query, user) => {
  const context = await buildRecommendationContext(query, user);
  const where = buildWhereClause(query, context);

  const artisans = await prisma.artisan.findMany({
    where,
    include: recommendationInclude,
  });

  const recommendations = artisans
    .map((artisan) => {
      const recommendation = calculateScore(artisan, context, query);

      return {
        ...artisan,
        hourlyRate: toNumber(artisan.hourlyRate),
        averageRating: recommendation.averageRating,
        completedRequestsCount: recommendation.completedRequestsCount,
        recommendation: {
          score: recommendation.score,
          distanceKm: recommendation.distanceKm,
          scoreBreakdown: recommendation.scoreBreakdown,
        },
      };
    })
    .filter((artisan) => (
      artisan.recommendation.distanceKm === null
      || !query.maxDistanceKm
      || artisan.recommendation.distanceKm <= query.maxDistanceKm
    ))
    .sort((left, right) => {
      if (right.recommendation.score !== left.recommendation.score) {
        return right.recommendation.score - left.recommendation.score;
      }

      return (right.averageRating || 0) - (left.averageRating || 0);
    })
    .slice(0, query.limit);

  return {
    context: {
      serviceRequestId: query.serviceRequestId || null,
      categoryId: context.categoryId || null,
      category: context.category || null,
      city: context.city || null,
      latitude: context.latitude ?? null,
      longitude: context.longitude ?? null,
      budget: context.budget ?? null,
    },
    data: recommendations,
  };
};
