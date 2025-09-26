-- CreateTable
CREATE TABLE "public"."Submissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submissions_pkey" PRIMARY KEY ("id")
);
