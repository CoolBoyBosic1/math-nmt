// app/api/progress/[userID]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ userID: string }> }
) {
  try {
    const { params } = await context;
    const { userID } = await params;

    // Отримуємо всі записи UserTask для даного користувача
    // Припустимо, що якщо passed_on не null – завдання виконано правильно,
    // а якщо passed_on === null – завдання виконано з помилкою.
    const userTasks = await prisma.userTask.findMany({
      where: { userID },
      include: {
        task: {
          select: { topicID: true },
        },
      },
    });

    // Групуємо завдання за topicID
    const progress: Record<string, { solved: number; errors: number }> = {};

    userTasks.forEach((ut) => {
      const topicID = ut.task.topicID;
      if (!progress[topicID]) {
        progress[topicID] = { solved: 0, errors: 0 };
      }
      if (ut.passed_on) {
        progress[topicID].solved += 1;
      } else {
        progress[topicID].errors += 1;
      }
    });

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Сталася помилка при отриманні прогресу" }, { status: 500 });
  }
}
