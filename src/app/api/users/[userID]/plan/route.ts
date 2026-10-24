// app/api/users/[userID]/plan/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    // Отримуємо userID з параметрів URL (без await)
    const { userID: userId } = await params;

    // Запит до бази даних для пошуку користувача та отримання останнього плану
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        Plan: {
          orderBy: { startDate: "desc" },
          take: 1,
          select: {
            id: true,
            hours: true,
            startDate: true,
            endDate: true,
            topicId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    // Якщо планів немає, activePlan встановлюємо як null
    const activePlan = user.Plan[0] || null;

    // Формуємо відповідь з даними користувача, плану та поточної дати
    const response = {
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
      },
      plan: activePlan,
      currentDate: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching user plan data:", error?.message ?? error);
    return NextResponse.json(
      { error: "Сталася помилка при отриманні даних плану" },
      { status: 500 }
    );
  }
}
