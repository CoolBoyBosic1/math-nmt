import { Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server"
import { isValidEndDate, isValidHours, END_DATE_ERROR, HOURS_ERROR } from "@/lib/validator/plan"

export async function GET() {
    try {
        const plans = await prisma.plan.findMany();
        return NextResponse.json(plans, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Prisma error: ${error.message}` }, { status: 503 });
    }
};

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.userID) throw new Error("Require userID");

        if (!isValidEndDate(body.endDate)) throw new Error(END_DATE_ERROR);
        if (!isValidHours(body.hours)) throw new Error(HOURS_ERROR);

        const plan: Plan = body;

        const newPlan = await prisma.plan.create({ data: plan });

        return NextResponse.json(newPlan, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: `Plan error: ${error.message}` }, { status: 503 });
    }

}