import express from 'express';
import auth from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';
import {
  createServiceRequest,
  deleteServiceRequest,
  getServiceRequestById,
  listServiceRequests,
  updateServiceRequest,
  updateServiceRequestStatus,
} from './serviceRequests.controller.js';

const router = express.Router();

router.get('/', auth, listServiceRequests);
router.post('/', auth, upload.array('images', 10), createServiceRequest);
router.get('/:id', auth, getServiceRequestById);
router.put('/:id', auth, upload.array('images', 10), updateServiceRequest);
router.patch('/:id/status', auth, updateServiceRequestStatus);
router.delete('/:id', auth, deleteServiceRequest);

export default router;
