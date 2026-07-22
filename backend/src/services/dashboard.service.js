import prisma from '../config/prisma.js';

const requestStatuses = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const assignmentStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
const userRoles = ['ADMIN', 'CUSTOMER', 'ARTISAN'];
const userStatuses = ['ACTIVE', 'SUSPENDED'];

const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

const zeroMap = (keys) => keys.reduce((result, key) => ({ ...result, [key]: 0 }), {});

const groupCounts = (groups, keyName, keys = []) => {
  const result = zeroMap(keys);

  for (const group of groups) {
    result[group[keyName]] = group._count._all;
  }

  return result;
};

const getAverageRating = (reviews) => {
  if (!reviews.length) {
    return null;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

const getMonthKeys = (months) => {
  const now = new Date();
  const keys = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
    keys.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`);
  }

  return keys;
};

const aggregateMonthly = (items, monthKeys) => {
  const counts = zeroMap(monthKeys);

  for (const item of items) {
    const createdAt = new Date(item.createdAt);
    const key = `${createdAt.getUTCFullYear()}-${String(createdAt.getUTCMonth() + 1).padStart(2, '0')}`;

    if (counts[key] !== undefined) {
      counts[key] += 1;
    }
  }

  return monthKeys.map((month) => ({ month, count: counts[month] }));
};

const paginate = (items, query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const startIndex = (page - 1) * limit;

  return {
    data: items.slice(startIndex, startIndex + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(Math.ceil(items.length / limit), 1),
    },
  };
};

export const getDashboardSummaryService = async () => {
  const [
    users,
    artisans,
    categories,
    serviceRequests,
    assignments,
    reviews,
    notifications,
    unreadNotifications,
    favorites,
    completedRequests,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.artisan.count(),
    prisma.category.count(),
    prisma.serviceRequest.count(),
    prisma.assignment.count(),
    prisma.review.count(),
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.favoriteArtisan.count(),
    prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
  ]);

  const ratingAggregate = await prisma.review.aggregate({
    _avg: { rating: true },
  });

  return {
    totals: {
      users,
      artisans,
      categories,
      serviceRequests,
      assignments,
      reviews,
      notifications,
      unreadNotifications,
      favorites,
    },
    performance: {
      completedRequests,
      completionRate: serviceRequests ? Number(((completedRequests / serviceRequests) * 100).toFixed(1)) : 0,
      averageRating: ratingAggregate._avg.rating ? Number(ratingAggregate._avg.rating.toFixed(1)) : null,
    },
  };
};

export const getUserStatisticsService = async () => {
  const [total, byRoleGroups, byStatusGroups] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  return {
    total,
    byRole: groupCounts(byRoleGroups, 'role', userRoles),
    byStatus: groupCounts(byStatusGroups, 'status', userStatuses),
  };
};

export const getArtisanStatisticsService = async () => {
  const [total, verified, available, byCategoryGroups] = await prisma.$transaction([
    prisma.artisan.count(),
    prisma.artisan.count({ where: { verified: true } }),
    prisma.artisan.count({ where: { availability: true } }),
    prisma.artisan.groupBy({ by: ['categoryId'], _count: { _all: true } }),
  ]);

  const categories = await prisma.category.findMany({
    where: { id: { in: byCategoryGroups.map((group) => group.categoryId) } },
    select: { id: true, name: true },
  });
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  return {
    total,
    verified,
    unverified: total - verified,
    available,
    unavailable: total - available,
    byCategory: byCategoryGroups.map((group) => ({
      categoryId: group.categoryId,
      categoryName: categoryNames.get(group.categoryId) || null,
      count: group._count._all,
    })),
  };
};

export const getCategoryStatisticsService = async () => {
  const [total, categories] = await prisma.$transaction([
    prisma.category.count(),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            artisans: true,
            requests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    total,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      artisanCount: category._count.artisans,
      requestCount: category._count.requests,
    })),
  };
};

export const getServiceRequestStatisticsService = async () => {
  const [total, byStatusGroups, withBudget, completed] = await prisma.$transaction([
    prisma.serviceRequest.count(),
    prisma.serviceRequest.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.serviceRequest.aggregate({ _avg: { budget: true } }),
    prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
  ]);

  return {
    total,
    byStatus: groupCounts(byStatusGroups, 'status', requestStatuses),
    averageBudget: toNumber(withBudget._avg.budget),
    completed,
    completionRate: total ? Number(((completed / total) * 100).toFixed(1)) : 0,
  };
};

export const getAssignmentStatisticsService = async () => {
  const [total, byStatusGroups] = await prisma.$transaction([
    prisma.assignment.count(),
    prisma.assignment.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  return {
    total,
    byStatus: groupCounts(byStatusGroups, 'status', assignmentStatuses),
  };
};

export const getReviewStatisticsService = async () => {
  const [total, ratingAggregate, byRatingGroups] = await prisma.$transaction([
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.review.groupBy({ by: ['rating'], _count: { _all: true } }),
  ]);

  return {
    total,
    averageRating: ratingAggregate._avg.rating ? Number(ratingAggregate._avg.rating.toFixed(1)) : null,
    byRating: groupCounts(byRatingGroups, 'rating', [1, 2, 3, 4, 5]),
  };
};

export const getNotificationStatisticsService = async () => {
  const [total, read, unread] = await prisma.$transaction([
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: true } }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  return {
    total,
    read,
    unread,
    readRate: total ? Number(((read / total) * 100).toFixed(1)) : 0,
  };
};

export const getMonthlyDashboardStatisticsService = async (query) => {
  const monthKeys = getMonthKeys(query.months);
  const start = new Date(`${monthKeys[0]}-01T00:00:00.000Z`);

  const [users, serviceRequests] = await prisma.$transaction([
    prisma.user.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    prisma.serviceRequest.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    }),
  ]);

  return {
    userRegistrations: aggregateMonthly(users, monthKeys),
    serviceRequests: aggregateMonthly(serviceRequests, monthKeys),
  };
};

export const getTopArtisansService = async (query) => {
  const artisans = await prisma.artisan.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          city: true,
          country: true,
          profilePicture: true,
        },
      },
      category: true,
      requests: {
        select: {
          id: true,
          status: true,
          reviews: { select: { rating: true } },
        },
      },
      favorites: { select: { id: true } },
    },
  });

  const ranked = artisans
    .map((artisan) => {
      const reviews = artisan.requests.flatMap((request) => request.reviews);
      const completedRequests = artisan.requests.filter((request) => request.status === 'COMPLETED').length;
      const averageRating = getAverageRating(reviews);
      const score = Number((
        (averageRating || 0) * 20
        + completedRequests * 5
        + artisan.favorites.length * 3
        + (artisan.verified ? 10 : 0)
      ).toFixed(1));

      return {
        id: artisan.id,
        user: artisan.user,
        category: artisan.category,
        verified: artisan.verified,
        availability: artisan.availability,
        experienceYears: artisan.experienceYears,
        hourlyRate: toNumber(artisan.hourlyRate),
        averageRating,
        reviewCount: reviews.length,
        completedRequests,
        favoriteCount: artisan.favorites.length,
        score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return (right.averageRating || 0) - (left.averageRating || 0);
    });

  return paginate(ranked, query);
};

export const getTopCategoriesService = async (query) => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          artisans: true,
          requests: true,
        },
      },
      requests: { select: { status: true } },
    },
  });

  const ranked = categories
    .map((category) => {
      const completedRequests = category.requests.filter((request) => request.status === 'COMPLETED').length;
      const score = category._count.requests * 5 + category._count.artisans * 3 + completedRequests * 2;

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        artisanCount: category._count.artisans,
        requestCount: category._count.requests,
        completedRequests,
        score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.requestCount - left.requestCount;
    });

  return paginate(ranked, query);
};
