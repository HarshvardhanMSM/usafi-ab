import { Prisma, DocumentStatus, ReviewAction } from '@prisma/client';
import { prisma } from '../config/database';
import {
  DocumentTypeInput,
  UpdateDocumentTypeInput,
  CreateStaffDocumentInput,
  UpdateStaffDocumentInput,
  StaffDocumentQuery,
  CreatePolicyDocumentInput,
  UpdatePolicyDocumentInput,
  PolicyDocumentQuery,
} from '../types/document.types';

export class DocumentRepository {
  // ==========================================
  // DOCUMENT TYPE REPOSITORY METHODS
  // ==========================================

  async findAllDocumentTypes() {
    return prisma.documentType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findDocumentTypeById(id: string) {
    return prisma.documentType.findUnique({
      where: { id },
    });
  }

  async findDocumentTypeByCode(code: string) {
    return prisma.documentType.findUnique({
      where: { code },
    });
  }

  async createDocumentType(input: DocumentTypeInput) {
    return prisma.documentType.create({
      data: {
        code: input.code,
        name: input.name,
        isMandatory: input.isMandatory ?? true,
      },
    });0
  }

  async updateDocumentType(id: string, input: UpdateDocumentTypeInput) {
    return prisma.documentType.update({
      where: { id },
      data: {
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.isMandatory !== undefined ? { isMandatory: input.isMandatory } : {}),
      },
    });
  }

  async deleteDocumentType(id: string) {
    return prisma.documentType.delete({
      where: { id },
    });
  }

  // ==========================================
  // STAFF DOCUMENT REPOSITORY METHODS
  // ==========================================

  async findStaffDocuments(query: StaffDocumentQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.StaffDocumentWhereInput = {};

    if (query.staffId) {
      whereClause.staffId = query.staffId;
    }

    if (query.documentTypeId) {
      whereClause.documentTypeId = query.documentTypeId;
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    const [items, total] = await Promise.all([
      prisma.staffDocument.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
        include: {
          documentType: true,
          staff: {
            select: {
              id: true,
              workerCode: true,
              email: true,
              phone: true,
            },
          },
          reviews: {
            orderBy: { reviewedAt: 'desc' },
            include: {
              reviewer: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.staffDocument.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findStaffDocumentById(id: string) {
    return prisma.staffDocument.findUnique({
      where: { id },
      include: {
        documentType: true,
        staff: {
          select: {
            id: true,
            workerCode: true,
            email: true,
            phone: true,
          },
        },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async createStaffDocument(staffId: string, input: CreateStaffDocumentInput) {
    return prisma.staffDocument.create({
      data: {
        staffId,
        documentTypeId: input.documentTypeId,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        status: DocumentStatus.PENDING,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      },
      include: {
        documentType: true,
      },
    });
  }

  async updateStaffDocument(id: string, input: UpdateStaffDocumentInput) {
    return prisma.staffDocument.update({
      where: { id },
      data: {
        ...(input.documentTypeId !== undefined ? { documentTypeId: input.documentTypeId } : {}),
        ...(input.fileUrl !== undefined ? { fileUrl: input.fileUrl } : {}),
        ...(input.fileName !== undefined ? { fileName: input.fileName } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.expiryDate !== undefined ? { expiryDate: input.expiryDate ? new Date(input.expiryDate) : null } : {}),
      },
      include: {
        documentType: true,
        reviews: true,
      },
    });
  }

  async deleteStaffDocument(id: string) {
    return prisma.staffDocument.delete({
      where: { id },
    });
  }

  // ==========================================
  // DOCUMENT REVIEW REPOSITORY METHOD (TRANSACTIONAL)
  // ==========================================

  async createDocumentReview(
    staffDocumentId: string,
    reviewerId: string,
    action: ReviewAction,
    rejectionReason?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const newStatus = action === ReviewAction.APPROVED ? DocumentStatus.APPROVED : DocumentStatus.REJECTED;

      const review = await tx.documentReview.create({
        data: {
          staffDocumentId,
          reviewerId,
          action,
          rejectionReason: rejectionReason ?? null,
        },
      });

      await tx.staffDocument.update({
        where: { id: staffDocumentId },
        data: { status: newStatus },
      });

      return tx.documentReview.findUnique({
        where: { id: review.id },
        include: {
          reviewer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          staffDocument: {
            include: {
              documentType: true,
            },
          },
        },
      });
    });
  }

  // ==========================================
  // POLICY DOCUMENT REPOSITORY METHODS
  // ==========================================

  async findPolicyDocuments(query: PolicyDocumentQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PolicyDocumentWhereInput = {};

    if (query.category) {
      whereClause.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.policyDocument.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.policyDocument.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findPolicyDocumentById(id: string) {
    return prisma.policyDocument.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async createPolicyDocument(createdById: string | null, input: CreatePolicyDocumentInput) {
    return prisma.policyDocument.create({
      data: {
        title: input.title,
        category: input.category,
        fileUrl: input.fileUrl,
        version: input.version ?? '1.0',
        isMandatoryAcknowledgement: input.isMandatoryAcknowledgement ?? false,
        createdById: createdById ?? null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updatePolicyDocument(id: string, input: UpdatePolicyDocumentInput) {
    return prisma.policyDocument.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.fileUrl !== undefined ? { fileUrl: input.fileUrl } : {}),
        ...(input.version !== undefined ? { version: input.version } : {}),
        ...(input.isMandatoryAcknowledgement !== undefined ? { isMandatoryAcknowledgement: input.isMandatoryAcknowledgement } : {}),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deletePolicyDocument(id: string) {
    return prisma.policyDocument.delete({
      where: { id },
    });
  }
}

export const documentRepository = new DocumentRepository();
