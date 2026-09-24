-- CreateTable
CREATE TABLE "InfrastructureHealth" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfrastructureHealth_pkey" PRIMARY KEY ("id")
);
