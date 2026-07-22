import express from 'express';
import auth, { authorizeRoles } from '../../middleware/auth.js';
import {
  getArtisanStatistics,
  getAssignmentStatistics,
  getCategoryStatistics,
  getDashboardSummary,
  getMonthlyDashboardStatistics,
  getNotificationStatistics,
  getReviewStatistics,
  getServiceRequestStatistics,
  getTopArtisans,
  getTopCategories,
  getUserStatistics,
} from './dashboard.controller.js';

const router = express.Router();

router.use(auth, authorizeRoles('ADMIN'));

router.get('/summary', getDashboardSummary);
router.get('/users', getUserStatistics);
router.get('/artisans', getArtisanStatistics);
router.get('/categories', getCategoryStatistics);
router.get('/service-requests', getServiceRequestStatistics);
router.get('/assignments', getAssignmentStatistics);
router.get('/reviews', getReviewStatistics);
router.get('/notifications', getNotificationStatistics);
router.get('/monthly', getMonthlyDashboardStatistics);
router.get('/top-artisans', getTopArtisans);
router.get('/top-categories', getTopCategories);

export default router;
