import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getAnswerType,
  checkSingleLetterAnswer,
  checkMultipleLettersAnswer,
  checkNumberAnswer,
  checkIfTimerNeeded,
  formatTime,
  calculateCompletionTime,
  handleTestCompletion,
} from "@/app/test_mode/utils";

const task = (type: string, answer: string) => ({ id: "t1", problem: "p", solution: "s", type, answer });

describe("UT-14..17 getAnswerType", () => {
  it("UT-14 ONE з літерою → singleLetter", () => {
    expect(getAnswerType(task("ONE", "Б"))).toBe("singleLetter");
  });
  it("UT-15 ONE з числом → number", () => {
    expect(getAnswerType(task("ONE", "12,5"))).toBe("number");
  });
  it("UT-16 MATCH → multipleLetters", () => {
    expect(getAnswerType(task("MATCH", '{"1":"А"}'))).toBe("multipleLetters");
  });
  it("UT-17 невідомий тип → number", () => {
    expect(getAnswerType(task("TYPE", "7"))).toBe("number");
  });
});

describe("UT-18..23 перевірка відповідей", () => {
  it("UT-18 однакова літера — правильна відповідь", () => {
    expect(checkSingleLetterAnswer("В", "В")).toBe(true);
  });
  it("UT-19 інша літера — неправильна відповідь", () => {
    expect(checkSingleLetterAnswer("А", "В")).toBe(false);
  });
  it("UT-20 відповідність: усі пари збігаються", () => {
    expect(checkMultipleLettersAnswer({ 1: "А", 2: "Г", 3: "Д" }, { 1: "А", 2: "Г", 3: "Д" })).toBe(true);
  });
  it("UT-21 відповідність: одна пара хибна", () => {
    expect(checkMultipleLettersAnswer({ 1: "А", 2: "Б", 3: "Д" }, { 1: "А", 2: "Г", 3: "Д" })).toBe(false);
  });
  it("UT-22 число з комою дорівнює числу з крапкою", () => {
    expect(checkNumberAnswer("2,5", "2.5")).toBe(true);
  });
  it("UT-23 нечисловий ввід — неправильна відповідь", () => {
    expect(checkNumberAnswer("abc", "2.5")).toBe(false);
  });
});

describe("UT-24..26 checkIfTimerNeeded", () => {
  it("UT-24 тест минулого року (назва з цифри) — з таймером", () => {
    expect(checkIfTimerNeeded("2023 основна сесія")).toBe(true);
  });
  it("UT-25 «Швидкий тест» — з таймером", () => {
    expect(checkIfTimerNeeded("Швидкий тест")).toBe(true);
  });
  it("UT-26 тема — без таймера", () => {
    expect(checkIfTimerNeeded("Похідна функції")).toBe(false);
  });
});

describe("UT-27..30 час", () => {
  afterEach(() => vi.useRealTimers());
  it("UT-27 formatTime(125) → 02:05", () => {
    expect(formatTime(125)).toBe("02:05");
  });
  it("UT-28 formatTime(0) → 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });
  it("UT-29 calculateCompletionTime(null) → 0", () => {
    expect(calculateCompletionTime(null)).toBe(0);
  });
  it("UT-30 calculateCompletionTime рахує секунди від старту", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-12T10:01:30Z"));
    expect(calculateCompletionTime(new Date("2026-11-12T10:00:00Z").getTime())).toBe(90);
  });
});

describe("UT-31..32 handleTestCompletion", () => {
  it("UT-31 з таймером додає час до URL результатів", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-12T10:01:00Z"));
    const router = { push: vi.fn() };
    handleTestCompletion({
      startTime: new Date("2026-11-12T10:00:00Z").getTime(),
      shouldUseTimer: true,
      topicId: "topic-1",
      results: { correct: 18, total: 22 },
      router,
    });
    expect(router.push).toHaveBeenCalledWith("/result_page?topicId=topic-1&correct=18&total=22&time=60");
    vi.useRealTimers();
  });
  it("UT-32 без таймера — URL без параметра time", () => {
    const router = { push: vi.fn() };
    handleTestCompletion({ startTime: null, shouldUseTimer: false, topicId: "t", results: { correct: 1, total: 2 }, router });
    expect(router.push).toHaveBeenCalledWith("/result_page?topicId=t&correct=1&total=2");
  });
});
