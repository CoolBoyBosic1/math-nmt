import { describe, it, expect } from "vitest";
import { isValidNickname, isValidEmail, isValidPassword } from "@/lib/validator/user";
import { isValidEndDate, isValidHours, MIN_DAYS, MAX_HOURS } from "@/lib/validator/plan";
import { hashPassword, verifyPassword, withoutPassword } from "@/lib/users";

describe("UT-01..04 isValidNickname", () => {
  it("UT-01 приймає латиницю та цифри", () => {
    expect(isValidNickname("Mykola2026")).toBe(true);
  });
  it("UT-02 відхиляє кирилицю", () => {
    expect(isValidNickname("Микола")).toBe(false);
  });
  it("UT-03 відхиляє нік довший за 20 символів", () => {
    expect(isValidNickname("a".repeat(21))).toBe(false);
  });
  it("UT-04 приймає нік рівно з 20 символів", () => {
    expect(isValidNickname("a".repeat(20))).toBe(true);
  });
});

describe("UT-05..07 isValidEmail", () => {
  it("UT-05 приймає коректний email", () => {
    expect(isValidEmail("student@school.ua")).toBe(true);
  });
  it("UT-06 відхиляє email без @", () => {
    expect(isValidEmail("student.school.ua")).toBe(false);
  });
  it("UT-07 відхиляє email з пробілом", () => {
    expect(isValidEmail("stu dent@school.ua")).toBe(false);
  });
});

describe("UT-08..11 isValidPassword", () => {
  it("UT-08 приймає пароль з 8 латинських символів і цифр", () => {
    expect(isValidPassword("abcd1234")).toBe(true);
  });
  it("UT-09 відхиляє пароль із 7 символів", () => {
    expect(isValidPassword("abc1234")).toBe(false);
  });
  it("UT-10 відхиляє пароль із 21 символу", () => {
    expect(isValidPassword("a1".repeat(10) + "b")).toBe(false);
  });
  it("UT-11 відхиляє пароль зі спецсимволом", () => {
    expect(isValidPassword("abcd123!")).toBe(false);
  });
});

describe("UT-12..13 валідатори плану (D1–D2 виправлено)", () => {
  it("UT-12 дата НМТ раніше ніж через MIN_DAYS днів — невалідна, через 30 днів — валідна", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + MIN_DAYS - 2);
    const later = new Date();
    later.setDate(later.getDate() + 30);
    expect(isValidEndDate(soon)).toBe(false);
    expect(isValidEndDate(later)).toBe(true);
  });
  it("UT-13 години на тиждень: 10 — валідно, більше MAX_HOURS або 0 — ні", () => {
    expect(isValidHours(10)).toBe(true);
    expect(isValidHours(MAX_HOURS + 20)).toBe(false);
    expect(isValidHours(0)).toBe(false);
  });
});

describe("UT-33..35 паролі", () => {
  it("UT-33 hashPassword не зберігає пароль відкритим текстом", async () => {
    const hash = await hashPassword("abcd1234");
    expect(hash).not.toBe("abcd1234");
    expect(hash.startsWith("$2")).toBe(true);
  });
  it("UT-34 verifyPassword приймає правильний і відхиляє хибний пароль", async () => {
    const hash = await hashPassword("abcd1234");
    expect(await verifyPassword("abcd1234", hash)).toBe(true);
    expect(await verifyPassword("abcd9999", hash)).toBe(false);
  });
  it("UT-35 withoutPassword прибирає пароль із відповіді", () => {
    const u = withoutPassword({ id: "u1", email: "a@b.ua", password: "x" });
    expect(u).toEqual({ id: "u1", email: "a@b.ua" });
  });
});
