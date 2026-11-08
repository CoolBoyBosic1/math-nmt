import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidNickname, isValidEmail, isValidPassword, NICKNAME_ERROR, PASSWORD_ERROR } from "@/lib/validator/user";
import { hashPassword, publicUserSelect } from "@/lib/users";
import { badRequest, errorResponse } from "@/lib/api-error";

export async function GET(req: Request, context: { params: Promise<{ userID: string }> }) {
  try {
    const { params } = await context;
    const { userID } = await params;

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userID },
      select: publicUserSelect,
    });

    return NextResponse.json(user, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "GET /api/users/[userID]");
  }
};

export async function PUT(request: Request, context: { params: Promise<{ userID: string }> }) {
  try {
    const { params } = await context;
    const { userID } = await params;

    const body = await request.json();

    if (!body.firstName) throw badRequest("Require firstname");
    if (!body.nickname) throw badRequest("Require nickname");
    if (!body.email) throw badRequest("Require email");
    if (!body.password) throw badRequest("Require password");

    if (!isValidNickname(body.nickname)) throw badRequest(NICKNAME_ERROR);
    if (!isValidEmail(body.email)) throw badRequest("Invalid email");
    if (!isValidPassword(body.password)) throw badRequest(PASSWORD_ERROR);

    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: {
        firstName: body.firstName,
        nickname: body.nickname,
        email: body.email,
        password: await hashPassword(body.password),
      },
      select: publicUserSelect,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "PUT /api/users/[userID]");
  }
};

export async function PATCH(request: Request, context: { params: Promise<{ userID: string }> }) {
  try {
    const { params } = await context;
    const { userID } = await params;

    const body = await request.json();

    if (body.nickname !== undefined && !isValidNickname(body.nickname)) throw badRequest(NICKNAME_ERROR);
    if (body.email !== undefined && !isValidEmail(body.email)) throw badRequest("Invalid email");
    if (body.password !== undefined && !isValidPassword(body.password)) throw badRequest(PASSWORD_ERROR);

    // undefined Prisma пропускає, тож оновлюються лише передані дозволені поля.
    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: {
        firstName: body.firstName,
        nickname: body.nickname,
        email: body.email,
        password: body.password !== undefined ? await hashPassword(body.password) : undefined,
      },
      select: publicUserSelect,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "PATCH /api/users/[userID]");
  }
};

export async function DELETE(request: Request, context: { params: Promise<{ userID: string }> }) {
  try {
    const { params } = await context;
    const { userID } = await params;

    const deletedUser = await prisma.user.delete({
      where: {
        id: userID,
      },
      select: publicUserSelect,
    });

    return NextResponse.json(deletedUser, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "DELETE /api/users/[userID]");
  }
}
