// Інтеграційні тести на справжній PostgreSQL (БД після міграції та seed).
// Запускаються, лише якщо задано DATABASE_URL; у CI піднімається сервіс postgres.
import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import * as users from "@/app/api/users/route";
import * as topics from "@/app/api/topics/route";
import * as topicById from "@/app/api/topics/[topicID]/route";
import * as plans from "@/app/api/plans/route";
import * as planProgress from "@/app/api/plans/[planID]/progress/route";

const hasDb = Boolean(process.env.DATABASE_URL);
const DERIVATIVE_TOPIC = "c89b9ed6-3593-4cc8-b06c-3ffc2615c723"; // «Похідна функції»
const NMT_2024 = "6a7b3225-93ec-4998-8844-cfb2d319688d";

const post = (body: unknown) => new Request("http://test.local", { method: "POST", body: JSON.stringify(body) });
const createdUsers: string[] = [];

describe.skipIf(!hasDb)("IT-11..16 API + PostgreSQL", () => {
  afterAll(async () => {
    if (!hasDb) return;
    await prisma.plan.deleteMany({ where: { userID: { in: createdUsers } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUsers } } });
    await prisma.$disconnect();
  });

  it("IT-11 GET /api/topics повертає 29 тем МОН із seed", async () => {
    const res = await topics.GET();
    const list = await res.json();
    expect(res.status).toBe(200);
    expect(list.length).toBeGreaterThanOrEqual(29);
  });

  it("IT-12 тема «Похідна функції» має теорію і 5 задач із картинками", async () => {
    const res = await topicById.GET(new Request("http://test.local"), { params: Promise.resolve({ topicID: DERIVATIVE_TOPIC }) });
    const topic = await res.json();
    expect(res.status).toBe(200);
    expect(topic.Theory.content).toContain("Похідна");
    expect(topic.Task).toHaveLength(5);
    expect(topic.Task[0].problem).toMatch(/^tasks\/sections\/problems\/14\.\d\.png$/);
  });

  it("IT-13 НМТ-2024 містить 22 завдання з відповідями всіх трьох типів", async () => {
    const res = await topicById.GET(new Request("http://test.local"), { params: Promise.resolve({ topicID: NMT_2024 }) });
    const { Task } = await res.json();
    expect(Task).toHaveLength(22);
    expect(new Set(Task.map((t: { type: string }) => t.type))).toEqual(new Set(["ONE", "MATCH", "TYPE"]));
  });

  it("IT-14 реєстрація зберігає bcrypt-хеш, а не пароль", async () => {
    const email = `it-${Date.now()}@matnmt.local`;
    const res = await users.POST(post({ nickname: "ittest", email, password: "abcd1234" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.password).toBeUndefined();
    createdUsers.push(body.id);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: body.id } });
    expect(row.password).not.toBe("abcd1234");
    expect(row.password.startsWith("$2")).toBe(true);
  });

  it("IT-15 повторна реєстрація з тим самим email → 409", async () => {
    const email = `dup-${Date.now()}@matnmt.local`;
    const first = await (await users.POST(post({ nickname: "dup1", email, password: "abcd1234" }))).json();
    createdUsers.push(first.id);
    const res = await users.POST(post({ nickname: "dup2", email, password: "abcd1234" }));
    expect(res.status).toBe(409);
  });

  it("IT-16 створення плану і порожній прогрес", async () => {
    const userId = createdUsers[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 120);
    const res = await plans.POST(post({ userID: userId, hours: 8, endDate: endDate.toISOString() }));
    const plan = await res.json();
    expect(res.status).toBe(200);
    expect(plan.hours).toBe(8);
    const prog = await planProgress.GET(new Request("http://test.local"), { params: Promise.resolve({ planID: plan.id }) });
    expect((await prog.json()).topicProgress).toEqual([]);
  });
});
