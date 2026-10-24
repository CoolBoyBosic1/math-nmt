-- Початкова міграція: відтворює схему prisma/schema.prisma (7 таблиць).

-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('ONE', 'MATCH', 'TYPE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" TEXT,
    "nickname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" UUID NOT NULL,
    "parentID" UUID NOT NULL DEFAULT '96a2384c-2c11-45b6-af7d-ca04cdffea84'::uuid,
    "title" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theory" (
    "topicID" UUID NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Theory_pkey" PRIMARY KEY ("topicID")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "topicID" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "type" "AnswerType" NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTask" (
    "userID" UUID NOT NULL,
    "taskID" UUID NOT NULL,
    "passed_on" TIMESTAMP(3),

    CONSTRAINT "UserTask_pkey" PRIMARY KEY ("userID","taskID")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "hours" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "topicId" UUID,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTask" (
    "planID" UUID NOT NULL,
    "taskID" UUID NOT NULL,

    CONSTRAINT "PlanTask_pkey" PRIMARY KEY ("planID","taskID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Theory" ADD CONSTRAINT "Theory_topicID_fkey" FOREIGN KEY ("topicID") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_topicID_fkey" FOREIGN KEY ("topicID") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_taskID_fkey" FOREIGN KEY ("taskID") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTask" ADD CONSTRAINT "PlanTask_planID_fkey" FOREIGN KEY ("planID") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTask" ADD CONSTRAINT "PlanTask_taskID_fkey" FOREIGN KEY ("taskID") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
