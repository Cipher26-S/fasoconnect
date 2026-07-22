import express from 'express';
import { createCategory, listCategories } from './categories.controller.js';
import auth, { authorizeRoles } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', listCategories);
router.post('/', auth, authorizeRoles('ADMIN'), createCategory);

export default router;
