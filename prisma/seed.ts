/**
 * Наповнення БД: дерево тем МОН, теорія, задачі за темами, минулорічні НМТ,
 * швидкий тест і демо-користувач.
 *
 * Зображення задач лежать у public/tasks; правильні відповіді зчитано з
 * картинок розв'язків скриптом prisma/data/detect_answers.py → prisma/data/answers.json.
 *
 * Запуск: npx prisma db seed   (або npm run db:seed)
 * Скрипт ідемпотентний: повторний запуск оновлює записи, а не дублює їх.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PrismaClient, AnswerType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const ROOT = path.join(__dirname, "..");
const DATA = path.join(__dirname, "data");

// Корінь дерева тем — значення за замовчуванням Topic.parentID у схемі.
const ROOT_TOPIC_ID = "96a2384c-2c11-45b6-af7d-ca04cdffea84";

// Фіксовані ID зі сторінки last_year_nmt (основні сесії, для яких є зображення).
const PAST_NMT: Record<string, string> = {
  "2024": "6a7b3225-93ec-4998-8844-cfb2d319688d",
  "2023": "66a6f7f2-1920-44e5-ac8f-b17df9ec0c71",
  "2022": "3a59f843-b695-4442-9e83-befebd428660",
};

// Демо-користувач, на якого посилаються сторінки плану до появи входу в акаунт.
export const DEMO_USER_ID = "7b9f3bd3-1429-4764-b718-c2c472a77518";

/** Детермінований UUID (v5-подібний) з рядка — щоб seed був ідемпотентним. */
function stableId(name: string): string {
  const h = createHash("sha1").update(`math-nmt:${name}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

type Answer = { type: "ONE" | "MATCH" | "TYPE"; answer: string };
const answers: Record<string, Answer> = JSON.parse(readFileSync(path.join(DATA, "answers.json"), "utf8"));
const theory: Record<string, string> = JSON.parse(readFileSync(path.join(DATA, "theory.json"), "utf8"));
const groups: { title: string; topics: { name: string; id: string }[] }[] = JSON.parse(
  readFileSync(path.join(DATA, "topics.json"), "utf8"),
);

/** Природне сортування імен файлів на кшталт 2.10 після 2.9. */
function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true });
}

function listTasks(folder: string, filter: (file: string) => boolean = () => true) {
  return readdirSync(path.join(ROOT, "public", "tasks", folder, "problems"))
    .filter((f) => f.endsWith(".png") && filter(f))
    .sort(naturalSort);
}

async function upsertTopic(id: string, title: string, parentID: string) {
  await prisma.topic.upsert({ where: { id }, update: { title, parentID }, create: { id, title, parentID } });
}

async function upsertTask(topicID: string, folder: string, file: string, description: string) {
  const key = `${folder}/${file}`;
  const a = answers[key];
  if (!a) return false; // напр. двоскладові відповіді, які модель поки не підтримує
  const id = stableId(key);
  const data = {
    topicID,
    description,
    problem: `tasks/${folder}/problems/${file}`,
    solution: `tasks/${folder}/solutions/${file}`,
    type: a.type as AnswerType,
    answer: a.answer,
  };
  await prisma.task.upsert({ where: { id }, update: data, create: { id, ...data } });
  return true;
}

async function main() {
  await upsertTopic(ROOT_TOPIC_ID, "// Математика", ROOT_TOPIC_ID);

  // 1. Дерево тем МОН: групи → 29 тем із фіксованими ID (на них посилається UI).
  let index = 0;
  let sectionTasks = 0;
  for (const g of groups) {
    const groupId = stableId(`group:${g.title}`);
    await upsertTopic(groupId, g.title, ROOT_TOPIC_ID);
    for (const t of g.topics) {
      index += 1;
      await upsertTopic(t.id, t.name, groupId);
      await prisma.theory.upsert({
        where: { topicID: t.id },
        update: { content: theory[String(index)] },
        create: { topicID: t.id, content: theory[String(index)] },
      });
      for (const file of listTasks("sections", (f) => f.startsWith(`${index}.`))) {
        const n = file.split(".")[1];
        if (await upsertTask(t.id, "sections", file, `${t.name} · завдання ${n}`)) sectionTasks += 1;
      }
    }
  }

  // 2. Минулорічні НМТ (основні сесії 2022–2024).
  let nmtTasks = 0;
  for (const [year, id] of Object.entries(PAST_NMT)) {
    await upsertTopic(id, `${year} · основна сесія`, ROOT_TOPIC_ID);
    for (const file of listTasks("previousNMT", (f) => f.startsWith(`${year}.1.`))) {
      const n = file.split(".")[2];
      if (await upsertTask(id, "previousNMT", file, `НМТ-${year}, основна сесія, завдання ${n}`)) nmtTasks += 1;
    }
  }

  // 3. Швидкий тест.
  const quickId = stableId("topic:quick-test");
  await upsertTopic(quickId, "Швидкий тест", ROOT_TOPIC_ID);
  let quickTasks = 0;
  for (const file of listTasks("quick_test")) {
    if (await upsertTask(quickId, "quick_test", file, `Швидкий тест · ${file.replace(".png", "")}`)) quickTasks += 1;
  }

  // 4. Демо-користувач і його план (пароль хешовано).
  const password = await bcrypt.hash("demo12345", 10);
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: { id: DEMO_USER_ID, nickname: "demo", firstName: "Демо", email: "demo@matnmt.local", password },
  });
  const planId = stableId("plan:demo");
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 180);
  await prisma.plan.upsert({
    where: { id: planId },
    update: { hours: 6, endDate },
    create: { id: planId, userID: DEMO_USER_ID, hours: 6, endDate },
  });

  console.log(
    `Seed готово: ${index} тем із теорією, ${sectionTasks} задач за темами, ` +
      `${nmtTasks} задач НМТ 2022–2024, ${quickTasks} задач швидкого тесту, демо-користувач demo@matnmt.local`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
