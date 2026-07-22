import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import {
  dashboardMonthlyQuerySchema,
  dashboardPaginationSchema,
} from '../../validators/dashboard.validator.js';
import {
  getArtisanStatisticsService,
  getAssignmentStatisticsService,
  getCategoryStatisticsService,
  getDashboardSummaryService,
  getMonthlyDashboardStatisticsService,
  getNotificationStatisticsService,
  getReviewStatisticsService,
  getServiceRequestStatisticsService,
  getTopArtisansService,
  getTopCategoriesService,
  getUserStatisticsService,
} from '../../services/dashboard.service.js';

const parseOrFail = (schema, value, next) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    next(new AppError(issue?.message || 'Invalid request data', 400));
    return null;
  }

  return parsed.data;
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummaryService();

  res.status(200).json({ success: true, data: summary });
});

export const getUserStatistics = asyncHandler(async (req, res) => {
  const statistics = await getUserStatisticsService();

  res.status(200).json({ success: true, data: statistics });
});

export const getArtisanStatistics = asyncHandler(async (req, res) => {
  const statistics = await getArtisanStatisticsService();

  res.status(200).json({ success: true, data: statistics });
});

export const getCategoryStatistics = asyncHandler(async (req, res) => {
  const statistics = await getCategoryStatisticsService();

  res.status(200).json({ success: true, data: statistics });
});

export const getServiceRequestStatistics = asyncHandler(async (req, res) => {
  const statistics = await getServiceRequestStatisticsService();

  res.status(200).json({ success: true, data: statistics });
});

export const getAssignmentStatistics = asyncHandler(async (req, res) => {
  const statistics = await getAssignmentStatisticsService();

  res.status(200).json({ success: true, data: statistics });
});

export const getReviewStatistics = asyncHandler(async (req, res) => {
  const statistics = await getReviewStatisticsService();

  res.status(200).json({ success: true, data: statistics });
});

export const getNotificationStatistics = asyncHandler(async (req, res) => {
  const statistics = await getNotificationStatisticsService();

  res.status(200).json({ success: true, data: statistics });
});

export const getMonthlyDashboardStatistics = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(dashboardMonthlyQuerySchema, req.query, next);
  if (!query) return;

  const statistics = await getMonthlyDashboardStatisticsService(query);

  res.status(200).json({ success: true, data: statistics });
});

export const getTopArtisans = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(dashboardPaginationSchema, req.query, next);
  if (!query) return;

  const result = await getTopArtisansService(query);

  res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
});

export const getTopCategories = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(dashboardPaginationSchema, req.query, next);
  if (!query) return;

  const result = await getTopCategoriesService(query);

  res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
});
