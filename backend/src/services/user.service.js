import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';

export const getUserProfileById = async (userId) => prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    profilePicture: true,
    bio: true,
    city: true,
    country: true,
    createdAt: true,
    updatedAt: true,
  },
});

export const updateUserProfile = async (userId, data) => prisma.user.update({
  where: { id: userId },
  data,
  select: {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    profilePicture: true,
    bio: true,
    city: true,
    country: true,
    createdAt: true,
    updatedAt: true,
  },
});

const adminUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  profilePicture: true,
  city: true,
  country: true,
  createdAt: true,
};

export const listUsersService = async (query) => {
  const andFilters = [];

  if (query.search) {
    andFilters.push({
      OR: [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ],
    });
  }

  if (query.role) andFilters.push({ role: query.role });
  if (query.status) andFilters.push({ status: query.status });

  const where = andFilters.length ? { AND: andFilters } : {};
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select: adminUserSelect, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
};

export const updateUserStatusService = async (userId, status) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return prisma.user.update({ where: { id: userId }, data: { status }, select: adminUserSelect });
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
};
