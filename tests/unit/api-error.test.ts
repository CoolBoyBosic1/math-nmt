import { describe, it, expect, vi } from "vitest";
import { ApiError, badRequest, classifyError, errorResponse } from "@/lib/api-error";

describe("UT-36..42 classifyError — HTTP-код за типом помилки", () => {
  it("UT-36 badRequest → 400 з власним повідомленням", () => {
    expect(classifyError(badRequest("Require userID"))).toEqual({ status: 400, message: "Require userID" });
  });
  it("UT-37 ApiError зберігає заданий код", () => {
    expect(classifyError(new ApiError(422, "Bad")).status).toBe(422);
  });
  it("UT-38 некоректний JSON (SyntaxError) → 400", () => {
    expect(classifyError(new SyntaxError("Unexpected token")).status).toBe(400);
  });
  it("UT-39 Prisma P2025 (запис не знайдено) → 404, P2002 (дублікат) → 409", () => {
    expect(classifyError({ code: "P2025" }).status).toBe(404);
    expect(classifyError({ code: "P2002" }).status).toBe(409);
  });
  it("UT-40 некоректний UUID від PostgreSQL (22P02) → 400", () => {
    expect(classifyError({ name: "DriverAdapterError", cause: { code: "22P02" } }).status).toBe(400);
  });
  it("UT-41 БД недоступна (ECONNREFUSED) → 503", () => {
    expect(classifyError({ code: "ECONNREFUSED" }).status).toBe(503);
  });
  it("UT-42 невідома помилка → 500 без деталей для клієнта", () => {
    expect(classifyError(new Error("secret SQL details"))).toEqual({ status: 500, message: "Internal server error" });
  });
});

describe("UT-43 errorResponse", () => {
  it("UT-43 повертає JSON { error } і пише в лог лише 5xx", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const bad = errorResponse(badRequest("Require hours"), "test");
    expect(bad.status).toBe(400);
    expect(await bad.json()).toEqual({ error: "Require hours" });
    expect(log).not.toHaveBeenCalled();
    expect(errorResponse(new Error("boom"), "test").status).toBe(500);
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });
});
