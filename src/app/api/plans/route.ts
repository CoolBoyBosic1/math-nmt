import { prisma } from "@/lib/db";
import { NextResponse } from "next/server"
import { isValidEndDate, isValidHours, END_DATE_ERROR, HOURS_ERROR } from "@/lib/validator/plan"
import { badRequest, errorResponse } from "@/lib/api-error";
import { requireUserId } from "@/lib/session";

export async function GET() {
    try {
        const plans = await prisma.plan.findMany();
        return NextResponse.json(plans, { status: 200 });
    }
    catch (error) {
        return errorResponse(error, "GET /api/plans");
    }
};

export async function POST(request: Request) {
    try {
        // План завжди створюється для користувача з сесії, а не з тіла запиту.
        const userID = await requireUserId();
        const body = await request.json();

        if (!isValidEndDate(body.endDate)) throw badRequest(END_DATE_ERROR);
        if (!isValidHours(body.hours)) throw badRequest(HOURS_ERROR);

        // Лише дозволені поля: id, startDate та інші службові поля клієнт не задає.
        const newPlan = await prisma.plan.create({
            data: { userID, hours: body.hours, endDate: body.endDate },
        });

        return NextResponse.json(newPlan, { status: 200 });
    }
    catch (error) {
        return errorResponse(error, "POST /api/plans");
    }
}
