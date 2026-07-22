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

const favoriteInclude = {
  artisan: {
    include: {
      user: { select: userSelect },
      category: true,
      requests: { select: { reviews: { select: { rating: true } } } },
    },
  },
};

const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

const getAverageRating = (artisan) => {
  const reviews = (artisan.requests || []).flatMap((request) => request.reviews || []);

  if (!reviews.length) {
    return null;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

const serializeFavorite = (favorite) => ({
  ...favorite,
  artisan: favorite.artisan
    ? {
      ...favorite.artisan,
      hourlyRate: toNumber(favorite.artisan.hourlyRate),
      averageRating: getAverageRating(favorite.artisan),
    }
    : null,
});

export const listFavoriteArtisansService = async (user, query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const where = { userId: user.id };

  const [favorites, total] = await prisma.$transaction([
    prisma.favoriteArtisan.findMany({
      where,
      include: favoriteInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.favoriteArtisan.count({ where }),
  ]);

  return {
    data: favorites.map(serializeFavorite),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const addFavoriteArtisanService = async (user, artisanId) => {
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    include: {
      user: { select: { id: true } },
    },
  });

  if (!artisan) {
    throw new AppError('Artisan not found', 404);
  }

  if (artisan.userId === user.id) {
    throw new AppError('You cannot add your own artisan profile to favorites', 400);
  }

  try {
    const favorite = await prisma.favoriteArtisan.create({
      data: {
        userId: user.id,
        artisanId,
      },
      include: favoriteInclude,
    });

    return serializeFavorite(favorite);
  } catch (error) {
    if (error?.code === 'P2002') {
      throw new AppError('This artisan is already in your favorites', 409);
    }
    if (error?.code === 'P2003') {
      throw new AppError('Invalid user or artisan reference', 400);
    }
    throw error;
  }
};

export const removeFavoriteArtisanService = async (user, artisanId) => {
  const favorite = await prisma.favoriteArtisan.findUnique({
    where: {
      userId_artisanId: {
        userId: user.id,
        artisanId,
      },
    },
  });

  if (!favorite) {
    throw new AppError('Favorite artisan not found', 404);
  }

  await prisma.favoriteArtisan.delete({
    where: {
      userId_artisanId: {
        userId: user.id,
        artisanId,
      },
    },
  });
};
