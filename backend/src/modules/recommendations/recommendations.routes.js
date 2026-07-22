import express from 'express';
import auth from '../../middleware/auth.js';
import { recommendArtisans } from './recommendations.controller.js';

const router = express.Router();

router.get('/artisans', auth, recommendArtisans);

export default router;
