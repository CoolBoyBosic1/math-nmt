// Інтеграційні тести рівня API: справжній обробник маршруту Next.js + валідатори + Prisma-мок.
// Реальна PostgreSQL підключається на наступному кроці (тестова БД у CI).
import { describe, it, expect, vi, beforeEach } from "vitest";

const prisma = vi.hoisted(() => ({
  user: { create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  topic: { findMany: vi.fn(), findUniqueOrThrow: vi.fn() },
  task: { create: vi.fn() },
  plan: { create: vi.fn(), findUnique: vi.fn() },
  userTask: { findMany: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma }));

import * as users from "@/app/api/users/route";
import * as userById from "@/app/api/users/[userID]/route";
import * as topics from "@/app/api/topics/route";
import * as topicById from "@/app/api/topics/[topicID]/route";
import * as topicTasks from "@/app/api/topics/[topicID]/tasks/route";
import * as plans from "@/app/api/plans/route";
import * as planProgress from "@/app/api/plans/[planID]/progress/route";
import * as userProgress from "@/app/api/progress/[userID]/route";

const req = (body?: unknown) =>
  new Request("http://test.local", { method: "POST", body: body ? JSON.stringify(body) : undefined });

beforeEach(() => vi.clearAllMocks());

describe("IT-01..03 POST /api/users — реєстрація", () => {
  it("IT-01 коректні дані → 200 і запис у БД", async () => {
    prisma.user.create.mockResolvedValue({ id: "u1", nickname: "mykola", email: "m@ua.ua" });
    const res = await users.POST(req({ nickname: "mykola", email: "m@ua.ua", password: "abcd1234" }));
    expect(res.status).toBe(200);
    expect(prisma.user.create).toHaveBeenCalledOnce();
    const saved = prisma.user.create.mock.calls[0][0];
    expect(saved.data.password).not.toBe("abcd1234"); // пароль хешовано
    expect(saved.select.password).toBeUndefined(); // пароль не повертається
  });
  it("IT-02 email уже зареєстровано (P2002) → 409", async () => {
    prisma.user.create.mockRejectedValue({ code: "P2002" });
    const res = await users.POST(req({ nickname: "mykola", email: "m@ua.ua", password: "abcd1234" }));
    expect(res.status).toBe(409);
  });
  it("IT-03 некоректний email → помилка, у БД нічого не пишеться", async () => {
    const res = await users.POST(req({ nickname: "mykola", email: "bad", password: "abcd1234" }));
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});

describe("IT-04 PATCH /api/users/[userID]", () => {
  it("IT-04 слабкий пароль має відхилятися", async () => {
    prisma.user.update.mockResolvedValue({ id: "u1" });
    const res = await userById.PATCH(req({ password: "123" }), { params: Promise.resolve({ userID: "u1" }) });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe("IT-05..07 теми та задачі", () => {
  it("IT-05 GET /api/topics → 200 і список тем", async () => {
    prisma.topic.findMany.mockResolvedValue([{ id: "t1", title: "Похідна функції" }]);
    const res = await topics.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });
  it("IT-06 GET /api/topics/[id] неіснуючої теми → 404", async () => {
    prisma.topic.findUniqueOrThrow.mockRejectedValue(new Error("No Topic found"));
    const res = await topicById.GET(req(), { params: Promise.resolve({ topicID: "missing" }) });
    expect(res.status).toBe(404);
  });
  it("IT-07 POST /api/topics/[id]/tasks без відповіді → 400", async () => {
    const res = await topicTasks.POST(req({ topicID: "t1", description: "d", problem: "p", solution: "s", type: "ONE" }));
    expect(res.status).toBe(400);
    expect(prisma.task.create).not.toHaveBeenCalled();
  });
});

describe("IT-08..10 план і прогрес", () => {
  it("IT-08 POST /api/plans без userID → помилка", async () => {
    const res = await plans.POST(req({ hours: 10 }));
    expect(res.status).toBe(503);
    expect(prisma.plan.create).not.toHaveBeenCalled();
  });
  it("IT-09 прогрес плану: статуси red / yellow / green за темами", async () => {
    prisma.plan.findUnique.mockResolvedValue({
      id: "p1", userID: "u1", startDate: new Date("2026-11-01"),
      PlanTask: [
        { task: { id: "a1", topicID: "A" } },
        { task: { id: "b1", topicID: "B" } }, { task: { id: "b2", topicID: "B" } },
        { task: { id: "c1", topicID: "C" } },
      ],
    });
    prisma.userTask.findMany.mockResolvedValue([
      { task: { id: "b1", topicID: "B" } },
      { task: { id: "c1", topicID: "C" } },
    ]);
    const res = await planProgress.GET(req(), { params: Promise.resolve({ planID: "p1" }) });
    const body = await res.json();
    const status = Object.fromEntries(body.topicProgress.map((t: any) => [t.topicID, t.status]));
    expect(status).toEqual({ A: "red", B: "yellow", C: "green" });
  });
  it("IT-10 прогрес користувача: розв’язані й помилки за темами", async () => {
    prisma.userTask.findMany.mockResolvedValue([
      { passed_on: new Date(), task: { topicID: "A" } },
      { passed_on: null, task: { topicID: "A" } },
      { passed_on: new Date(), task: { topicID: "B" } },
    ]);
    const res = await userProgress.GET(req(), { params: Promise.resolve({ userID: "u1" }) });
    expect((await res.json()).progress).toEqual({ A: { solved: 1, errors: 1 }, B: { solved: 1, errors: 0 } });
  });
});
