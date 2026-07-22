import express from 'express';
import auth, { authorizeRoles } from '../../middleware/auth.js';
import { changePassword, getProfile, listUsers, updateProfile, updateUserStatus } from './users.controller.js';

const router = express.Router();

router.get('/', auth, authorizeRoles('ADMIN'), listUsers);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.patch('/:id/status', auth, authorizeRoles('ADMIN'), updateUserStatus);

export default router;
