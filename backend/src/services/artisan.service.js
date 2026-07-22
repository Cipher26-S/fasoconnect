import { v2 as cloudinary } from 'cloudinary';
import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const toBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1';

const getAverageRating = (artisan) => {
  const reviews = (artisan.requests || []).flatMap((request) => request.reviews || []);

  if (!reviews.length) {
    return null;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

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

export const uploadArtisanProfilePicture = async (file) => {
  if (!file) {
    return null;
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary is not configured', 500);
  }

  const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: 'fasoconnect/artisans',
    resource_type: 'image',
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  });

  return result.secure_url;
};

export const upsertArtisanProfile = async (userId, data) => {
  const existing = await prisma.artisan.findUnique({ where: { userId } });
  const {
    fullName,
    bio,
    phone,
    city,
    country,
    profilePicture,
    categoryId,
    experienceYears,
    hourlyRate,
    latitude,
    longitude,
    availability,
    verified,
  } = data;

  const userPayload = {};
  if (fullName !== undefined) userPayload.fullName = fullName;
  if (bio !== undefined) userPayload.bio = bio;
  if (phone !== undefined) userPayload.phone = phone;
  if (city !== undefined) userPayload.city = city;
  if (country !== undefined) userPayload.country = country;
  if (profilePicture !== undefined) userPayload.profilePicture = profilePicture;

  const artisanPayload = {};
  if (categoryId !== undefined) artisanPayload.categoryId = categoryId;
  if (experienceYears !== undefined) artisanPayload.experienceYears = experienceYears;
  if (hourlyRate !== undefined) artisanPayload.hourlyRate = hourlyRate;
  if (latitude !== undefined) artisanPayload.latitude = latitude;
  if (longitude !== undefined) artisanPayload.longitude = longitude;
  if (availability !== undefined) artisanPayload.availability = availability;
  if (verified !== undefined) artisanPayload.verified = verified;

  if (!existing && (!categoryId || experienceYears === undefined)) {
    throw new AppError('Category and experience years are required to create an artisan profile', 400);
  }

  try {
    const artisan = await prisma.$transaction(async (tx) => {
      if (Object.keys(userPayload).length) {
        await tx.user.update({
          where: { id: userId },
          data: userPayload,
        });
      }

      if (existing) {
        return tx.artisan.update({
          where: { id: existing.id },
          data: artisanPayload,
          include: {
            user: { select: userSelect },
            category: true,
          },
        });
      }

      return tx.artisan.create({
        data: {
          ...artisanPayload,
          userId,
        },
        include: {
          user: { select: userSelect },
          category: true,
        },
      });
    });

    return { artisan, created: !existing };
  } catch (error) {
    if (error?.code === 'P2003') {
      throw new AppError('Invalid category reference', 400);
    }
    throw error;
  }
};

export const getOwnArtisanProfileService = async (userId) => prisma.artisan.findUnique({
  where: { userId },
  include: {
    user: { select: userSelect },
    category: true,
    requests: { select: { reviews: { select: { rating: true } } } },
  },
});

export const listArtisansService = async (query = {}) => {
  const {
    search,
    category,
    city,
    availability,
    verified,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const where = {};
  const userFilter = {};

  if (search) {
    where.OR = [
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
      { user: { city: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (category) {
    where.category = { name: { contains: category, mode: 'insensitive' } };
  }

  if (city) {
    userFilter.city = { contains: city, mode: 'insensitive' };
  }

  if (availability !== undefined) {
    where.availability = toBoolean(availability);
  }

  if (verified !== undefined) {
    where.verified = toBoolean(verified);
  }

  if (Object.keys(userFilter).length) {
    where.user = userFilter;
  }

  const artisans = await prisma.artisan.findMany({
    where,
    include: {
      user: { select: userSelect },
      category: true,
      requests: { select: { reviews: { select: { rating: true } } } },
    },
  });

  const enrichedArtisans = artisans.map((artisan) => ({
    ...artisan,
    averageRating: getAverageRating(artisan),
  }));

  if (sortBy === 'rating') {
    enrichedArtisans.sort((left, right) => {
      const leftRating = left.averageRating ?? 0;
      const rightRating = right.averageRating ?? 0;
      return sortOrder === 'asc' ? leftRating - rightRating : rightRating - leftRating;
    });
  } else if (sortBy === 'experience') {
    enrichedArtisans.sort((left, right) => (sortOrder === 'asc'
      ? left.experienceYears - right.experienceYears
      : right.experienceYears - left.experienceYears));
  } else {
    enrichedArtisans.sort((left, right) => (sortOrder === 'asc'
      ? new Date(left.createdAt) - new Date(right.createdAt)
      : new Date(right.createdAt) - new Date(left.createdAt)));
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const startIndex = (pageNumber - 1) * limitNumber;
  const pagedArtisans = enrichedArtisans.slice(startIndex, startIndex + limitNumber);

  return {
    data: pagedArtisans,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total: enrichedArtisans.length,
      totalPages: Math.max(Math.ceil(enrichedArtisans.length / limitNumber), 1),
    },
  };
};

export const getArtisanProfileService = async (id) => prisma.artisan.findUnique({
  where: { id },
  include: {
    user: { select: userSelect },
    category: true,
    requests: { select: { reviews: { select: { rating: true } } } },
  },
});

export const deleteArtisanProfileService = async (userId) => {
  const existing = await prisma.artisan.findUnique({ where: { userId } });

  if (!existing) {
    throw new AppError('Artisan profile not found', 404);
  }

  return prisma.artisan.delete({ where: { userId } });
};

export const verifyArtisanProfileService = async (id, verified = true) => {
  const existing = await prisma.artisan.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError('Artisan profile not found', 404);
  }

  return prisma.artisan.update({
    where: { id },
    data: { verified },
    include: {
      user: { select: userSelect },
      category: true,
    },
  });
};
