import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import {
  notificationParamSchema,
  notificationQuerySchema,
} from '../../validators/notification.validator.js';
import {
  getNotificationByIdService,
  listNotificationsService,
  markAllNotificationsAsReadService,
  markNotificationAsReadService,
} from '../../services/notification.service.js';

const parseOrFail = (schema, value, next) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    next(new AppError(issue?.message || 'Invalid request data', 400));
    return null;
  }

  return parsed.data;
};

export const listNotifications = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(notificationQuerySchema, req.query, next);
  if (!query) return;

  const result = await listNotificationsService(query, req.user);

  res.status(200).json({
    success: true,
    data: result.data,
    unreadCount: result.unreadCount,
    pagination: result.pagination,
  });
});

export const getNotificationById = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(notificationParamSchema, req.params, next);
  if (!params) return;

  const notification = await getNotificationByIdService(params.id, req.user);

  res.status(200).json({ success: true, data: notification });
});

export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(notificationParamSchema, req.params, next);
  if (!params) return;

  const notification = await markNotificationAsReadService(params.id, req.user);

  res.status(200).json({ success: true, data: notification });
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsAsReadService(req.user);

  res.status(200).json({ success: true, data: result });
});
