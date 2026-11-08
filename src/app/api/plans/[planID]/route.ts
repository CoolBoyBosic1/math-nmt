import { prisma } from "@/lib/db";
import { NextResponse } from "next/server"
import { isValidEndDate, isValidHours, END_DATE_ERROR, HOURS_ERROR } from "@/lib/validator/plan";
import { badRequest, errorResponse } from "@/lib/api-error";

export async function GET(request: Request, contex: { params: Promise<{ planID: string }> }) {
  try {
    const { params } = await contex;
    const { planID } = await params;

    const plan = await prisma.plan.findUniqueOrThrow(
      {
        where: {
          id: planID,
        }
      }
    );
    return NextResponse.json(plan, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "GET /api/plans/[planID]");
  }
};

export async function PUT(request: Request, contex: { params: Promise<{ planID: string }> }) {
  try {
    const { params } = await contex;
    const { planID } = await params;

    const body = await request.json();

    if (!body.hours) throw badRequest("Require hours");
    if (!body.endDate) throw badRequest("Require endDate");

    if (!isValidEndDate(body.endDate)) throw badRequest(END_DATE_ERROR);
    if (!isValidHours(body.hours)) throw badRequest(HOURS_ERROR);

    const updatePlan = await prisma.plan.update({
      where: {
        id: planID
      },
      data: { hours: body.hours, endDate: body.endDate },
    });
    return NextResponse.json(updatePlan, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "PUT /api/plans/[planID]");
  }
}

export async function PATCH(request: Request, contex: { params: Promise<{ planID: string }> }) {
  try {
    const { params } = await contex;
    const { planID } = await params;

    const body = await request.json();

    if (body.endDate !== undefined && !isValidEndDate(body.endDate)) throw badRequest(END_DATE_ERROR);
    if (body.hours !== undefined && !isValidHours(body.hours)) throw badRequest(HOURS_ERROR);

    // undefined Prisma пропускає, тож оновлюються лише передані поля.
    const updatePlan = await prisma.plan.update({
      where: {
        id: planID
      },
      data: { hours: body.hours, endDate: body.endDate },
    });
    return NextResponse.json(updatePlan, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "PATCH /api/plans/[planID]");
  }
}

export async function DELETE(request: Request, contex: { params: Promise<{ planID: string }> }) {
  try {
    const { params } = await contex;
    const { planID } = await params;

    const deletedPlan = await prisma.plan.delete({
      where: {
        id: planID
      }
    });
    return NextResponse.json(deletedPlan, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "DELETE /api/plans/[planID]");
  }
};
