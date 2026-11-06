import { prisma } from "@/lib/db";
import { NextResponse } from "next/server"
import { isValidEndDate, isValidHours, END_DATE_ERROR, HOURS_ERROR } from "@/lib/validator/plan"
import { badRequest, errorResponse } from "@/lib/api-error";

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
        const body = await request.json();

        if (!body.userID) throw badRequest("Require userID");
        if (!isValidEndDate(body.endDate)) throw badRequest(END_DATE_ERROR);
        if (!isValidHours(body.hours)) throw badRequest(HOURS_ERROR);

        // Лише дозволені поля: id, startDate та інші службові поля клієнт не задає.
        const newPlan = await prisma.plan.create({
            data: { userID: body.userID, hours: body.hours, endDate: body.endDate },
        });

        return NextResponse.json(newPlan, { status: 200 });
    }
    catch (error) {
        return errorResponse(error, "POST /api/plans");
    }
}
