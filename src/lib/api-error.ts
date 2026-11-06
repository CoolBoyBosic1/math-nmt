import { NextResponse } from "next/server";

/**
 * Помилка, причину якої знає сам обробник маршруту (невалідні дані, порожнє тіло тощо).
 * Кидаємо її замість `new Error(...)`, щоб відповідь отримала правильний HTTP-код.
 */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** 400: клієнт надіслав некоректні дані. */
export const badRequest = (message: string) => new ApiError(400, message);

type ErrorInfo = { status: number; message: string };

// Коди Prisma: https://www.prisma.io/docs/orm/reference/error-reference
const PRISMA_ERRORS: Record<string, ErrorInfo> = {
  P2025: { status: 404, message: "Record not found" },
  P2002: { status: 409, message: "Record already exists" },
  // Порушено зовнішній ключ: пов'язаного запису немає (create) або він ще використовується (delete).
  P2003: { status: 409, message: "Related record is missing or still in use" },
};

// Коди PostgreSQL, які драйвер pg передає через DriverAdapterError.cause.
const POSTGRES_ERRORS: Record<string, ErrorInfo> = {
  "22P02": { status: 400, message: "Invalid id format" },
};

// Немає з'єднання з БД — це справді «сервіс недоступний».
const UNAVAILABLE_CODES = new Set(["P1001", "P1002", "ECONNREFUSED", "ETIMEDOUT"]);

/** Визначає HTTP-код і безпечне повідомлення для будь-якої помилки обробника. */
export function classifyError(error: unknown): ErrorInfo {
  if (error instanceof ApiError) return { status: error.status, message: error.message };

  // request.json() на некоректному JSON кидає SyntaxError.
  if (error instanceof SyntaxError) return { status: 400, message: "Request body must be valid JSON" };

  // Перевіряємо поле code, а не instanceof: так однаково працюють і справжні помилки Prisma, і моки в тестах.
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = typeof e?.code === "string" ? e.code : undefined;
  const causeCode = typeof e?.cause?.code === "string" ? e.cause.code : undefined;

  if (code && PRISMA_ERRORS[code]) return PRISMA_ERRORS[code];
  if (causeCode && POSTGRES_ERRORS[causeCode]) return POSTGRES_ERRORS[causeCode];
  if ((code && UNAVAILABLE_CODES.has(code)) || (causeCode && UNAVAILABLE_CODES.has(causeCode))) {
    return { status: 503, message: "Database is unavailable" };
  }

  // Невідома помилка — це баг на сервері. Деталі не віддаємо клієнту, лише в лог.
  return { status: 500, message: "Internal server error" };
}

/** Перетворює помилку обробника на JSON-відповідь `{ error }` з правильним HTTP-кодом. */
export function errorResponse(error: unknown, context: string): NextResponse {
  const { status, message } = classifyError(error);
  if (status >= 500) console.error(`${context}:`, error);
  return NextResponse.json({ error: message }, { status });
}
