import asyncHandler from '../../common/asyncHandler.js';
import AppError from '../../common/appError.js';
import {
  createServiceRequestSchema,
  serviceRequestParamSchema,
  serviceRequestQuerySchema,
  updateServiceRequestSchema,
  updateServiceRequestStatusSchema,
} from '../../validators/serviceRequest.validator.js';
import { serializeRequest } from '../../utils/serialization.js';
import {
  createServiceRequestService,
  deleteServiceRequestService,
  getServiceRequestByIdService,
  listServiceRequestsService,
  updateServiceRequestService,
  updateServiceRequestStatusService,
  uploadServiceRequestImages,
} from '../../services/serviceRequest.service.js';

const parseOrFail = (schema, value, next) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues?.[0] || parsed.error.errors?.[0];
    next(new AppError(issue?.message || 'Invalid request data', 400));
    return null;
  }

  return parsed.data;
};

export const createServiceRequest = asyncHandler(async (req, res, next) => {
  const body = parseOrFail(createServiceRequestSchema, req.body, next);
  if (!body) return;

  const imageUrls = await uploadServiceRequestImages(req.files);
  const request = await createServiceRequestService(req.user, body, imageUrls);

  res.status(201).json({ success: true, data: serializeRequest(request) });
});

export const listServiceRequests = asyncHandler(async (req, res, next) => {
  const query = parseOrFail(serviceRequestQuerySchema, req.query, next);
  if (!query) return;

  const result = await listServiceRequestsService(query, req.user);

  res.status(200).json({
    success: true,
    data: result.data.map(serializeRequest),
    pagination: result.pagination,
  });
});

export const getServiceRequestById = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(serviceRequestParamSchema, req.params, next);
  if (!params) return;

  const request = await getServiceRequestByIdService(params.id, req.user);

  res.status(200).json({ success: true, data: serializeRequest(request) });
});

export const updateServiceRequest = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(serviceRequestParamSchema, req.params, next);
  const body = parseOrFail(updateServiceRequestSchema, req.body, next);
  if (!params || !body) return;

  const imageUrls = await uploadServiceRequestImages(req.files);
  const request = await updateServiceRequestService(params.id, req.user, body, imageUrls);

  res.status(200).json({ success: true, data: serializeRequest(request) });
});

export const updateServiceRequestStatus = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(serviceRequestParamSchema, req.params, next);
  const body = parseOrFail(updateServiceRequestStatusSchema, req.body, next);
  if (!params || !body) return;

  const request = await updateServiceRequestStatusService(params.id, req.user, body.status);

  res.status(200).json({ success: true, data: serializeRequest(request) });
});

export const deleteServiceRequest = asyncHandler(async (req, res, next) => {
  const params = parseOrFail(serviceRequestParamSchema, req.params, next);
  if (!params) return;

  await deleteServiceRequestService(params.id, req.user);

  res.status(200).json({ success: true, message: 'Service request deleted successfully' });
});
