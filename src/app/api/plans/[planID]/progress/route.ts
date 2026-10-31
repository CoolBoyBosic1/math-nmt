// File: app/api/plans/[planID]/progress/route.ts

import { prisma } from "@/lib/db"; // Шлях до вашого Prisma-клієнта
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ planID: string }> }
) {
  try {
    // 1. Отримуємо planID з параметрів маршруту
    const { planID } = await params;

    // 2. Знаходимо навчальний план із зв'язком PlanTask та інформацією про користувача
    const plan = await prisma.plan.findUnique({
      where: { id: planID },
      include: {
        PlanTask: {
          include: {
            task: {
              select: {
                id: true,
                topicID: true,
              },
            },
          },
        },
        User: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const userID = plan.userID;
    const startDate = plan.startDate; // Розв'язані завдання враховуються лише після створення плану

    // 3. Отримуємо список завдань, які входять у навчальний план
    const tasksInPlan = plan.PlanTask.map((pt) => pt.task);

    // 4. Отримуємо виконані завдання користувача за умови: passed_on >= startDate
    const userTasks = await prisma.userTask.findMany({
      where: {
        userID,
        passed_on: {
          gte: startDate,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            topicID: true,
          },
        },
      },
    });

    // 5. Групуємо завдання з плану за topicID та підраховуємо, скільки завдань для кожної теми призначено
    const topicMap = new Map<
      string,
      { topicID: string; totalInPlan: number; solved: number }
    >();

    tasksInPlan.forEach((task) => {
      const tID = task.topicID;
      if (!topicMap.has(tID)) {
        topicMap.set(tID, { topicID: tID, totalInPlan: 0, solved: 0 });
      }
      const data = topicMap.get(tID)!;
      data.totalInPlan++;
    });

    // 6. Обробляємо виконані завдання: для кожного завдання, якщо дата вирішення після startDate, збільшуємо solved
    userTasks.forEach((ut) => {
      const tID = ut.task.topicID;
      if (topicMap.has(tID)) {
        const data = topicMap.get(tID)!;
        // Ми вже враховуємо в запиті, що passed_on >= startDate, тому просто рахуємо:
        data.solved++;
      }
    });

    // 7. Визначаємо статус для кожної теми за співвідношенням вирішених завдань до призначених:
    //    - Якщо ratio = 0 (немає вирішених завдань) – статус "red"
    //    - Якщо ratio >= 1 (всі завдання вирішені) – статус "green"
    //    - Інакше – статус "yellow" (часткове проходження)
    const topicsArray = Array.from(topicMap.values());
    const topicProgress = topicsArray.map((tm) => {
      const ratio = tm.totalInPlan > 0 ? tm.solved / tm.totalInPlan : 0;
      let status = "yellow"; // за замовчуванням – частково виконано
      if (ratio === 0) status = "red";
      if (ratio >= 1) status = "green";
      return {
        topicID: tm.topicID,
        totalInPlan: tm.totalInPlan,
        solved: tm.solved,
        status,
        ratio, // цей показник можна використовувати для додаткового відображення
      };
    });

    return NextResponse.json({ plan, topicProgress }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/plans/[planID]/progress:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
