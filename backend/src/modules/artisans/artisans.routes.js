import express from 'express';
import auth, { authorizeRoles } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';
import {
  createOrUpdateArtisanProfile,
  deleteArtisanProfile,
  getArtisanProfile,
  getMyArtisanProfile,
  listArtisans,
  updateArtisanProfile,
  verifyArtisanProfile,
} from './artisans.controller.js';

const router = express.Router();

router.get('/', listArtisans);
router.get('/profile', auth, authorizeRoles('ARTISAN'), getMyArtisanProfile);
router.post('/profile', auth, authorizeRoles('ARTISAN'), upload.single('profilePicture'), createOrUpdateArtisanProfile);
router.put('/profile', auth, authorizeRoles('ARTISAN'), upload.single('profilePicture'), updateArtisanProfile);
router.delete('/profile', auth, authorizeRoles('ARTISAN'), deleteArtisanProfile);
router.patch('/:id/verify', auth, authorizeRoles('ADMIN'), verifyArtisanProfile);
router.get('/:id', getArtisanProfile);

export default router;
