import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, errorResponse } from "@/lib/api-error";

export async function GET() {
  try {
      const topics = await prisma.topic.findMany();
      return NextResponse.json(topics, { status: 200 });
  }
  catch (error) {
      return errorResponse(error, "GET /api/topics");
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.parentID) throw badRequest("Require parentID");
        if (!body.title) throw badRequest("Require title");

        const newTopic = await prisma.topic.create({
            data: { parentID: body.parentID, title: body.title },
        });

        return NextResponse.json(newTopic, { status: 201 });
    }
    catch (error) {
        return errorResponse(error, "POST /api/topics");
    }
}
