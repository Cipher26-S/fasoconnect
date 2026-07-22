import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import {
  assignmentParamSchema,
  assignmentQuerySchema,
  createAssignmentSchema,
} from '../../validators/assignment.validator.js';
import {
  acceptAssignmentService,
  completeAssignmentService,
  createAssignmentService,
  getAssignmentByIdService,
  listAssignmentsService,
  rejectAssignmentService,
} from '../../services/assignment.service.js';

const parseOrFail = (schema, value, next) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    next(new AppError(issue?.message || 'Invalid request data', 400));
    return null;
  }

  return parsed.data;
};

export const createAssignment = asyncHandler(async (req, res, next) => {
  const body = parseOrFail(createAssignmentSchema, req.body, next);
  if (!body) return;

  const assignment = await createAssignmentService(req.user, body);

  res.status(201).json({ success: true, data: assignment });
});

export const listAssignments = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(assignmentQuerySchema, req.query, next);
  if (!query) return;

  const result = await listAssignmentsService(query, req.user);

  res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
});

export const getAssignmentById = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(assignmentParamSchema, req.params, next);
  if (!params) return;

  const assignment = await getAssignmentByIdService(params.id, req.user);

  res.status(200).json({ success: true, data: assignment });
});

export const acceptAssignment = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(assignmentParamSchema, req.params, next);
  if (!params) return;

  const assignment = await acceptAssignmentService(params.id, req.user);

  res.status(200).json({ success: true, data: assignment });
});

export const rejectAssignment = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(assignmentParamSchema, req.params, next);
  if (!params) return;

  const assignment = await rejectAssignmentService(params.id, req.user);

  res.status(200).json({ success: true, data: assignment });
});

export const completeAssignment = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(assignmentParamSchema, req.params, next);
  if (!params) return;

  const assignment = await completeAssignmentService(params.id, req.user);

  res.status(200).json({ success: true, data: assignment });
});
