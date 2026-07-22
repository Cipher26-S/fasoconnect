import express from 'express';
import auth from '../../middleware/auth.js';
import {
  acceptAssignment,
  completeAssignment,
  createAssignment,
  getAssignmentById,
  listAssignments,
  rejectAssignment,
} from './assignments.controller.js';

const router = express.Router();

router.get('/', auth, listAssignments);
router.post('/', auth, createAssignment);
router.get('/:id', auth, getAssignmentById);
router.patch('/:id/accept', auth, acceptAssignment);
router.patch('/:id/reject', auth, rejectAssignment);
router.patch('/:id/complete', auth, completeAssignment);

export default router;
