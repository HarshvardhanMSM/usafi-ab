import { z } from 'zod';
import { DocumentStatus, ReviewAction } from '@prisma/client';

export const documentStatusEnum = z.nativeEnum(DocumentStatus);
export const reviewActionEnum = z.nativeEnum(ReviewAction);

export const createDocumentTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code cannot exceed 50 characters'),
  name: z.string().trim().min(2, 'Name is required').max(100),
  isMandatory: z.boolean().optional().default(true),
});

export const updateDocumentTypeSchema = createDocumentTypeSchema.partial();

export const createStaffDocumentSchema = z.object({
  staffId: z.string().uuid('Invalid staff UUID format').optional(),
  documentTypeId: z.string().uuid('Invalid document type UUID format'),
  fileUrl: z.string().trim().min(1, 'File URL is required'),
  fileName: z.string().trim().min(1, 'File name is required').max(255),
  expiryDate: z.coerce.date().optional(),
});

export const updateStaffDocumentSchema = z.object({
  documentTypeId: z.string().uuid('Invalid document type UUID format').optional(),
  fileUrl: z.string().trim().min(1).optional(),
  fileName: z.string().trim().min(1).max(255).optional(),
  status: documentStatusEnum.optional(),
  expiryDate: z.coerce.date().optional(),
});

export const staffDocumentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.string().uuid().optional(),
  documentTypeId: z.string().uuid().optional(),
  status: documentStatusEnum.optional(),
});

export const createDocumentReviewSchema = z
  .object({
    action: reviewActionEnum,
    rejectionReason: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.action === ReviewAction.REJECTED) {
        return !!data.rejectionReason && data.rejectionReason.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting a document',
      path: ['rejectionReason'],
    },
  );

export const createPolicyDocumentSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(200),
  category: z.string().trim().min(2, 'Category is required').max(100),
  fileUrl: z.string().trim().min(1, 'File URL is required'),
  version: z.string().trim().max(50).optional().default('1.0'),
  isMandatoryAcknowledgement: z.boolean().optional().default(false),
});

export const updatePolicyDocumentSchema = createPolicyDocumentSchema.partial();

export const policyDocumentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const documentIdParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});
