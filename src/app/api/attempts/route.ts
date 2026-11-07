import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, errorResponse } from "@/lib/api-error";
import { requireUserId } from "@/lib/session";
import { isCorrectAnswer } from "@/app/test_mode/utils";

/**
 * Зберігає спробу розв'язати задачу для користувача з сесії.
 * Правильність перевіряє сервер. Один запис UserTask на пару (користувач, задача):
 * passed_on = дата першого правильного розв'язку, null = поки що лише помилки.
 * Хибна відповідь після правильної вже розв'язану задачу не «розв'язує назад».
 */
export async function POST(request: Request) {
  try {
    const userID = await requireUserId();
    const body = await request.json();

    if (!body.taskID || typeof body.taskID !== "string") throw badRequest("Require taskID");
    if (body.answer === undefined || body.answer === null || body.answer === "") throw badRequest("Require answer");

    const task = await prisma.task.findUniqueOrThrow({
      where: { id: body.taskID },
      select: { id: true, type: true, answer: true },
    });
    const correct = isCorrectAnswer(task, body.answer);

    const key = { userID_taskID: { userID, taskID: task.id } };
    const existing = await prisma.userTask.findUnique({ where: key, select: { passed_on: true } });

    const attempt = await prisma.userTask.upsert({
      where: key,
      create: { userID, taskID: task.id, passed_on: correct ? new Date() : null },
      update: correct && !existing?.passed_on ? { passed_on: new Date() } : {},
    });

    return NextResponse.json({ correct, solved: attempt.passed_on !== null, passed_on: attempt.passed_on }, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "POST /api/attempts");
  }
}
