import express from 'express';
import { login, logout, me, refreshToken, register } from './auth.controller.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', auth, logout);
router.get('/me', auth, me);

export default router;
