import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';

const notificationInclude = {
  user: { select: { id: true, fullName: true, email: true, role: true } },
};

export const createNotificationRecord = async ({ userId, title, message }, client = prisma) => client.notification.create({
  data: {
    userId,
    title,
    message,
  },
});

const getScopedNotification = async (id, user) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
    include: notificationInclude,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (user.role === 'ADMIN' || notification.userId === user.id) {
    return notification;
  }

  throw new AppError('You do not have permission to access this notification', 403);
};

const buildWhereClause = (query, user) => {
  const andFilters = [];

  if (user.role === 'ADMIN') {
    if (query.user) {
      andFilters.push({ userId: query.user });
    }
  } else {
    andFilters.push({ userId: user.id });
  }

  if (query.isRead !== undefined) {
    andFilters.push({ isRead: query.isRead });
  }

  if (query.date) {
    const from = new Date(`${query.date}T00:00:00.000Z`);
    const to = new Date(`${query.date}T23:59:59.999Z`);
    andFilters.push({ createdAt: { gte: from, lte: to } });
  }

  return andFilters.length ? { AND: andFilters } : {};
};

export const listNotificationsService = async (query, user) => {
  const where = buildWhereClause(query, user);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      include: notificationInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        ...where,
        isRead: false,
      },
    }),
  ]);

  return {
    data: notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getNotificationByIdService = async (id, user) => getScopedNotification(id, user);

export const markNotificationAsReadService = async (id, user) => {
  await getScopedNotification(id, user);

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
    include: notificationInclude,
  });
};

export const markAllNotificationsAsReadService = async (user) => {
  const where = user.role === 'ADMIN' ? { userId: user.id } : { userId: user.id };

  const result = await prisma.notification.updateMany({
    where: {
      ...where,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { updatedCount: result.count };
};
