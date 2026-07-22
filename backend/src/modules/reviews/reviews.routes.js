import express from 'express';
import auth from '../../middleware/auth.js';
import {
  createReview,
  getReviewById,
  listReviews,
} from './reviews.controller.js';

const router = express.Router();

router.get('/', auth, listReviews);
router.post('/', auth, createReview);
router.get('/:id', auth, getReviewById);

export default router;
