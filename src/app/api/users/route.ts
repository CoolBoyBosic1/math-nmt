import { NextResponse } from "next/server";
import { isValidNickname, isValidEmail, isValidPassword, NICKNAME_ERROR, PASSWORD_ERROR } from "@/lib/validator/user";
import { prisma } from "@/lib/db";
import { hashPassword, publicUserSelect } from "@/lib/users";
import { badRequest, errorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: publicUserSelect });
    return NextResponse.json(users, { status: 200 });
  }
  catch (error) {
    return errorResponse(error, "GET /api/users");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nickname) throw badRequest("Require nickname");
    if (!body.email) throw badRequest("Require email");
    if (!body.password) throw badRequest("Require password");

    if (!isValidNickname(body.nickname)) throw badRequest(NICKNAME_ERROR);
    if (!isValidEmail(body.email)) throw badRequest("Invalid email");
    if (!isValidPassword(body.password)) throw badRequest(PASSWORD_ERROR);

    // Лише дозволені поля: id та інші службові поля клієнт не задає.
    const newUser = await prisma.user.create({
      data: {
        nickname: body.nickname,
        email: body.email,
        firstName: typeof body.firstName === "string" ? body.firstName : undefined,
        password: await hashPassword(body.password),
      },
      select: publicUserSelect,
    });

    return NextResponse.json(newUser, { status: 200 });
  }
  catch (error) {
    // P2002 (email уже зареєстровано) errorResponse перетворює на 409.
    return errorResponse(error, "POST /api/users");
  }
}
