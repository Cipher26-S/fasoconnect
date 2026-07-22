import express from 'express';
import auth from '../../middleware/auth.js';
import {
  getNotificationById,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notifications.controller.js';

const router = express.Router();

router.get('/', auth, listNotifications);
router.patch('/read-all', auth, markAllNotificationsAsRead);
router.get('/:id', auth, getNotificationById);
router.patch('/:id/read', auth, markNotificationAsRead);

export default router;
