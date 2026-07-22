import prisma from '../config/prisma.js';
import AppError from '../common/appError.js';
import { createNotificationRecord } from './notification.service.js';

const activeAssignmentStatuses = ['PENDING', 'ACCEPTED'];

const assignmentInclude = {
  serviceRequest: {
    include: {
      customer: { select: { id: true, fullName: true, email: true, phone: true, city: true, country: true } },
      category: true,
      images: true,
    },
  },
  artisan: {
    include: {
      user: { select: { id: true, fullName: true, email: true, phone: true, city: true, country: true } },
      category: true,
    },
  },
  assignedByUser: { select: { id: true, fullName: true, email: true, role: true } },
};

const getArtisanProfileForUser = async (user) => {
  if (user.role !== 'ARTISAN') {
    return null;
  }

  return prisma.artisan.findUnique({ where: { userId: user.id } });
};

const assertAdmin = (user) => {
  if (user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to perform this action', 403);
  }
};

const getScopedAssignment = async (id, user) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (user.role === 'ADMIN') {
    return assignment;
  }

  const artisan = await getArtisanProfileForUser(user);
  if (artisan && assignment.artisanId === artisan.id) {
    return assignment;
  }

  throw new AppError('You do not have permission to access this assignment', 403);
};

const buildWhereClause = async (query, user) => {
  const andFilters = [];

  if (user.role === 'ARTISAN') {
    const artisan = await getArtisanProfileForUser(user);
    andFilters.push({ artisanId: artisan?.id || '__no_artisan_profile__' });
  } else if (user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to access assignments', 403);
  }

  if (query.status) {
    andFilters.push({ status: query.status });
  }

  if (query.artisan) {
    andFilters.push({ artisanId: query.artisan });
  }

  if (query.serviceRequest) {
    andFilters.push({ serviceRequestId: query.serviceRequest });
  }

  if (query.date) {
    const from = new Date(`${query.date}T00:00:00.000Z`);
    const to = new Date(`${query.date}T23:59:59.999Z`);
    andFilters.push({ createdAt: { gte: from, lte: to } });
  }

  return andFilters.length ? { AND: andFilters } : {};
};

export const createAssignmentService = async (user, data) => {
  assertAdmin(user);

  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id: data.serviceRequestId },
  });

  if (!serviceRequest) {
    throw new AppError('Service request not found', 404);
  }

  const artisan = await prisma.artisan.findUnique({
    where: { id: data.artisanId },
  });

  if (!artisan) {
    throw new AppError('Artisan not found', 404);
  }

  if (serviceRequest.status === 'COMPLETED' || serviceRequest.status === 'CANCELLED') {
    throw new AppError('Completed or cancelled service requests cannot be assigned', 400);
  }

  const activeAssignment = await prisma.assignment.findFirst({
    where: {
      serviceRequestId: data.serviceRequestId,
      status: { in: activeAssignmentStatuses },
    },
  });

  if (activeAssignment) {
    throw new AppError('This service request already has an active assignment', 409);
  }

  return prisma.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id: data.serviceRequestId },
      data: {
        artisanId: data.artisanId,
        status: 'ASSIGNED',
      },
    });

    const assignment = await tx.assignment.create({
      data: {
        serviceRequestId: data.serviceRequestId,
        artisanId: data.artisanId,
        assignedBy: user.id,
        message: data.message,
      },
      include: assignmentInclude,
    });

    await createNotificationRecord({
      userId: artisan.userId,
      title: 'New assignment',
      message: `You have been assigned to service request "${assignment.serviceRequest.title}".`,
    }, tx);

    return assignment;
  });
};

export const listAssignmentsService = async (query, user) => {
  const where = await buildWhereClause(query, user);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [assignments, total] = await prisma.$transaction([
    prisma.assignment.findMany({
      where,
      include: assignmentInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.assignment.count({ where }),
  ]);

  return {
    data: assignments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getAssignmentByIdService = async (id, user) => getScopedAssignment(id, user);

export const acceptAssignmentService = async (id, user) => {
  const assignment = await getScopedAssignment(id, user);

  if (user.role !== 'ARTISAN') {
    throw new AppError('Only the assigned artisan can accept this assignment', 403);
  }

  if (assignment.status !== 'PENDING') {
    throw new AppError(`Cannot accept assignment with status ${assignment.status}`, 400);
  }

  if (assignment.serviceRequest.status === 'COMPLETED' || assignment.serviceRequest.status === 'CANCELLED') {
    throw new AppError('Completed or cancelled service requests cannot be accepted', 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id: assignment.serviceRequestId },
      data: {
        artisanId: assignment.artisanId,
        status: 'ACCEPTED',
      },
    });

    const updatedAssignment = await tx.assignment.update({
      where: { id },
      data: { status: 'ACCEPTED' },
      include: assignmentInclude,
    });

    await createNotificationRecord({
      userId: assignment.serviceRequest.customerId,
      title: 'Assignment accepted',
      message: `Your service request "${assignment.serviceRequest.title}" has been accepted by the artisan.`,
    }, tx);

    return updatedAssignment;
  });
};

export const rejectAssignmentService = async (id, user) => {
  const assignment = await getScopedAssignment(id, user);

  if (user.role !== 'ARTISAN') {
    throw new AppError('Only the assigned artisan can reject this assignment', 403);
  }

  if (assignment.status !== 'PENDING') {
    throw new AppError(`Cannot reject assignment with status ${assignment.status}`, 400);
  }

  return prisma.$transaction(async (tx) => {
    if (assignment.serviceRequest.artisanId === assignment.artisanId && assignment.serviceRequest.status === 'ASSIGNED') {
      await tx.serviceRequest.update({
        where: { id: assignment.serviceRequestId },
        data: {
          artisanId: null,
          status: 'PENDING',
        },
      });
    }

    const updatedAssignment = await tx.assignment.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: assignmentInclude,
    });

    await createNotificationRecord({
      userId: assignment.serviceRequest.customerId,
      title: 'Assignment rejected',
      message: `The artisan rejected the assignment for "${assignment.serviceRequest.title}".`,
    }, tx);

    return updatedAssignment;
  });
};

export const completeAssignmentService = async (id, user) => {
  const assignment = await getScopedAssignment(id, user);

  if (user.role !== 'ARTISAN') {
    throw new AppError('Only the assigned artisan can complete this assignment', 403);
  }

  if (assignment.status !== 'ACCEPTED') {
    throw new AppError(`Cannot complete assignment with status ${assignment.status}`, 400);
  }

  if (assignment.serviceRequest.status === 'CANCELLED') {
    throw new AppError('Cancelled service requests cannot be completed', 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id: assignment.serviceRequestId },
      data: {
        artisanId: assignment.artisanId,
        status: 'COMPLETED',
      },
    });

    const updatedAssignment = await tx.assignment.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: assignmentInclude,
    });

    await createNotificationRecord({
      userId: assignment.serviceRequest.customerId,
      title: 'Service completed',
      message: `Your service request "${assignment.serviceRequest.title}" has been marked as completed.`,
    }, tx);

    return updatedAssignment;
  });
};
