import express from 'express';
import auth from '../../middleware/auth.js';
import {
  addFavoriteArtisan,
  listFavoriteArtisans,
  removeFavoriteArtisan,
} from './favorites.controller.js';

const router = express.Router();

router.get('/artisans', auth, listFavoriteArtisans);
router.post('/artisans/:artisanId', auth, addFavoriteArtisan);
router.delete('/artisans/:artisanId', auth, removeFavoriteArtisan);

export default router;
