"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DEMO_USER_ID } from "@/lib/demo";

/* ієрархічна структура тем */
const rawTopics = [
  {
    name: "Цілі числа і вирази",
    subtopics: [
      { name: "Дійсні числа" },
      { name: "Відношення та пропорції" },
      { name: "Показникові, логарифмічні вирази" },
      { name: "Раціональні, ірраціональні числа" },
    ],
  },
  {
    name: "Рівняння нерівності та їхні системи",
    subtopics: [
      { name: "Лінійні, квадратні, раціональні рівняння та системи рівнянь" },
      { name: "Ірраціональні, тригонометричні рівняння та системи рівнянь" },
      { name: "Показникові, логарифмічні рівняння та системи рівнянь" },
      { name: "Нерівності та системи нерівностей" },
      { name: "Розв’язування задач за допомогою рівнянь і систем рівнянь" },
    ],
  },
  {
    name: "Функції",
    subtopics: [
      { name: "Числові послідовності" },
      { name: "Функціональна залежність" },
      { name: "Лінійні та квадратні функції" },
      { name: "Степеневі, показникові, логарифмічні та тригонометричні функції" },
      { name: "Похідна функції" },
      { name: "Первісна та визначений інтеграл" },
    ],
  },
  {
    name: "Комбінаторика, теорія ймовірностей, статистика",
    subtopics: [
      { name: "Перестановки, комбінації, розміщення. Комбінаторні правила суми та добутку" },
      { name: "Ймовірність випадкової події. Вибіркові характеристики" },
    ],
  },
  {
    name: "Планіметрія",
    subtopics: [
      { name: "Елементарні геометричні фігури на площині. Геометричні величини" },
      { name: "Трикутники" },
      { name: "Паралелограм. Ромб. Трапеція" },
      { name: "Прямокутник. Квадрат" },
      { name: "Коло та круг. Многокутники" },
      { name: "Координати та вектори на площині. Геометричні переміщення" },
    ],
  },
  {
    name: "Стереометрія",
    subtopics: [
      { name: "Прямі та площини у просторі" },
      { name: "Призма" },
      { name: "Піраміда" },
      { name: "Тіла обертання" },
      { name: "Координати та вектори у просторі" },
    ],
  },
];

/* ===== Набір параметрів для великих тем рев’ю ===== */
const reviewTopicNames = [
  "Цілі числа і вирази",
  "Рівняння нерівності та їхні системи",
  "Функції",
  "Комбінаторика, теорія ймовірностей, статистика",
  "Планіметрія",
  "Стереометрія",
];
const reviewComplexityList = [1.0, 1.5, 2.0, 1.2, 1.8, 1.9];
const reviewTasksPerHourList = [2, 3, 2, 3, 2, 3];

const reviewTopicSettings: Record<string, { complexity: number; tasksPerHour: number }> = {};
reviewTopicNames.forEach((name, i) => {
  reviewTopicSettings[name] = {
    complexity: reviewComplexityList[i],
    tasksPerHour: reviewTasksPerHourList[i],
  };
});

/* ===== Набір параметрів для маленьких тем ===== */
const smallTopicNames = [
  "Дійсні числа",
  "Відношення та пропорції",
  "Показникові, логарифмічні вирази",
  "Раціональні, ірраціональні числа",
  "Лінійні, квадратні, раціональні рівняння та системи рівнянь",
  "Ірраціональні, тригонометричні рівняння та системи рівнянь",
  "Показникові, логарифмічні рівняння та системи рівнянь",
  "Нерівності та системи нерівностей",
  "Розв’язування задач за допомогою рівнянь і систем рівнянь",
  "Числові послідовності",
  "Функціональна залежність",
  "Лінійні та квадратні функції",
  "Степеневі, показникові, логарифмічні та тригонометричні функції",
  "Похідна функції",
  "Первісна та визначений інтеграл",
];
const smallComplexityList = [1.0, 1.5, 2.5, 1.3, 1.5, 2.5, 2.7, 2.0, 2.0, 2.0, 2.0, 1.5, 2.5, 3.0, 3.0];
const smallTasksPerHourList = [2, 3, 3, 2, 3, 2, 2, 3, 2, 3, 3, 2, 3, 3, 3];

const smallTopicSettings: Record<string, { complexity: number; tasksPerHour: number }> = {};
smallTopicNames.forEach((name, i) => {
  smallTopicSettings[name] = {
    complexity: smallComplexityList[i],
    tasksPerHour: smallTasksPerHourList[i],
  };
});

/* ===== Функція flattenLeafTopics =====
   Перетворює rawTopics у масив листових тем із доданим полем parent ===== */
function flattenLeafTopics(topics: any[], parent: string | null = null) {
  let result: any[] = [];
  topics.forEach((topic) => {
    if (topic.subtopics && topic.subtopics.length > 0) {
      result = result.concat(flattenLeafTopics(topic.subtopics, topic.name));
    } else {
      result.push({
        topic: topic.name,
        parent,
        progress: topic.progress,
        ...{ complexity: 1.0, tasksPerHour: 2, errors: 0, solved: 0, status: "in-progress" },
      });
    }
  });
  return result;
}

/* ===== Функція getReviewTopics =====
   Повертає список великих тем рев’ю із rawTopics, що містяться в reviewTopicNames ===== */
function getReviewTopics(rawTopics: any[]) {
  const reviews: any[] = [];
  rawTopics.forEach((item) => {
    if (reviewTopicNames.includes(item.name)) {
      reviews.push({
        topic: item.name,
        progress: item.progress,
        ...reviewTopicSettings[item.name],
        errors: 0,
        solved: 0,
        status: "in-progress",
      });
    }
  });
  return reviews;
}

/* ===== Функція computeStudyPlan =====
   Обчислює індивідуальний план:
     - totalTime = (endDate - currentDate в днях) * (годин на тиждень) / 7
     - Розподіл часу:
         • Маленькі теми: 10% для теорії, 70% для практики
         • Великі теми (рев’ю): 20% для повторення
     - Для маленьких тем: tasksTotal = Math.round(practiceTime * tasksPerHour)
       Для великих тем: tasksTotal = Math.round(reviewTime * tasksPerHour)
*/
function computeStudyPlan(smallTopics: any[], bigTopics: any[], totalTime: number) {
  const totalSmallTimeTheory = totalTime * 0.1;
  const totalSmallTimePractice = totalTime * 0.7;
  const totalBigTimeReview = totalTime * 0.2;

  let totalSmallWeight = 0;
  smallTopics.forEach((topic) => {
    const solved = topic.solved || 0;
    const errors = topic.errors || 0;
    const totalAttempts = solved + errors;
    const errorRatio = totalAttempts > 0 ? errors / totalAttempts : 0;
    const weight = topic.complexity * (1 + errorRatio);
    topic._weight = weight;
    totalSmallWeight += weight;
  });
  smallTopics.forEach((topic) => {
    topic.theoryTime = totalSmallTimeTheory * (topic._weight / totalSmallWeight);
    topic.practiceTime = totalSmallTimePractice * (topic._weight / totalSmallWeight);
    topic.reviewTime = 0;
    topic.tasksTotal = Math.round(topic.practiceTime * topic.tasksPerHour);
    topic.status = "in-progress";
  });

  let totalBigWeight = 0;
  bigTopics.forEach((topic) => {
    const solved = topic.solved || 0;
    const errors = topic.errors || 0;
    const totalAttempts = solved + errors;
    const errorRatio = totalAttempts > 0 ? errors / totalAttempts : 0;
    const weight = topic.complexity * (1 + errorRatio);
    topic._weight = weight;
    totalBigWeight += weight;
  });
  bigTopics.forEach((topic) => {
    topic.reviewTime = totalBigTimeReview * (topic._weight / totalBigWeight);
    topic.tasksTotal = Math.round(topic.reviewTime * topic.tasksPerHour);
    topic.theoryTime = 0;
    topic.practiceTime = 0;
  });
  return { smallTopics, bigTopics };
}

/* ===== Функції трансформації для відображення ===== */
// Для маленьких тем: два рядки (Теорія та Практика). 
// Додаємо унікальний id: для теорії – "{topic}-theory", для практики – "{topic}-practice".
function transformSmallToDisplay(topic: any) {
  const topicName = topic.topic;
  const theoryRow = {
    id: `${topicName}-theory`,
    title: topicName,
    hours: parseFloat(topic.theoryTime.toFixed(1)),
    completedTasks: topic.solved,
    taskCount: 0,
    format: "Теорія",
    status: "red",
  };
  const practiceRow = {
    id: `${topicName}-practice`,
    title: topicName,
    hours: parseFloat(topic.practiceTime.toFixed(1)),
    completedTasks: topic.solved,
    taskCount: topic.tasksTotal,
    format: "Практика",
    status: topic.status,
  };
  return [theoryRow, practiceRow];
}

// Для великих тем: один рядок (Повторення)
function transformBigToDisplay(topic: any) {
  return {
    id: `${topic.topic}-review`,
    title: topic.topic,
    hours: parseFloat(topic.reviewTime.toFixed(1)),
    completedTasks: topic.solved,
    taskCount: topic.tasksTotal,
    format: "Повторення",
    status: topic.status,
  };
}

/**
 * Функція fetchUserProgress отримує дані прогресу користувача з бекенду.
 */
async function fetchUserProgress(userId: string) {
  try {
    const res = await fetch(`/api/progress/${userId}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Помилка завантаження прогресу: ${res.status}`);
    }
    const data = await res.json();
    return data.progress;
  } catch (err: any) {
    console.error("Error fetching user progress:", err?.message || err);
    return {};
  }
}

/**
 * Функція updateTheoryStatus надсилає оновлення стану теорії для теми.
 */
async function updateTheoryStatus(userId: string, topic: string, completed: boolean) {
  try {
    await fetch(`/api/theory-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, topic, completed }),
    });
  } catch (err) {
    console.error("Error updating theory status:", err);
  }
}

/**
 * Компонент StudyPlanPage відображає навчальний план.
 * Логіка статусу:
 * - Рядки "Теорія": керуються через чекбокс (якщо відмічено, статус "green", інакше "red").
 * - Рядки "Практика" та "Повторення": 
 *     completedTasks === 0 → "red";
 *     0 < completedTasks < taskCount → "yellow";
 *     completedTasks >= taskCount → "green".
 */
export default function StudyPlanPage() {
  const router = useRouter();
  const [userPlanData, setUserPlanData] = useState<any>(null);
  const [planRows, setPlanRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theoryCompleted, setTheoryCompleted] = useState<{ [id: string]: boolean }>({});

  const userId = DEMO_USER_ID; // TODO (Sprint 5): брати ID із сесії

  useEffect(() => {
    async function fetchData() {
      try {
        const resPlan = await fetch(`/api/users/${userId}/plan`, { cache: "no-store" });
        if (!resPlan.ok) {
          throw new Error(`Помилка завантаження плану: ${resPlan.status}`);
        }
        const planData = await resPlan.json();
        setUserPlanData(planData);

        const userProgress = await fetchUserProgress(userId);

        const flatSmallTopics = flattenLeafTopics(rawTopics);
        const smallTopics = flatSmallTopics.map((t) => ({
          ...t,
          ...(smallTopicSettings[t.topic] || {}),
          errors: userProgress[t.topic]?.errors ?? 0,
          solved: userProgress[t.topic]?.solved ?? 0,
        }));

        const reviewTopics = getReviewTopics(rawTopics);
        const bigTopics = reviewTopics.map((t) => ({
          ...t,
          errors: userProgress[t.topic]?.errors ?? 0,
          solved: userProgress[t.topic]?.solved ?? 0,
        }));

        const currentDate = new Date(planData.currentDate);
        const endDate = new Date(planData.plan.endDate);
        const diffTime = endDate.getTime() - currentDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        const totalTime = (diffDays * planData.plan.hours) / 7;

        const { smallTopics: computedSmall, bigTopics: computedBig } = computeStudyPlan(smallTopics, bigTopics, totalTime);

        const groupedSmall = computedSmall.reduce((acc: any, item: any) => {
          const groupKey = item.parent || "others";
          if (!acc[groupKey]) acc[groupKey] = [];
          acc[groupKey].push(item);
          return acc;
        }, {});

        let fullDisplay: any[] = [];
        rawTopics.forEach((parentTopic) => {
          const group = groupedSmall[parentTopic.name] || [];
          group.forEach((item: any) => {
            fullDisplay = fullDisplay.concat(transformSmallToDisplay(item));
          });
          if (reviewTopicNames.includes(parentTopic.name)) {
            const bigItem = computedBig.find((b: any) => b.topic === parentTopic.name);
            if (bigItem) fullDisplay.push(transformBigToDisplay(bigItem));
          }
        });
        if (groupedSmall["others"]) {
          groupedSmall["others"].forEach((item: any) => {
            fullDisplay = fullDisplay.concat(transformSmallToDisplay(item));
          });
        }

        const finalRows = fullDisplay.map((row: any) => {
          if (row.format !== "Теорія") {
            if (row.taskCount > 0) {
              if (row.completedTasks === 0) row.status = "red";
              else if (row.completedTasks < row.taskCount) row.status = "yellow";
              else row.status = "green";
            } else {
              row.status = "green";
            }
          }
          return row;
        });

        setPlanRows(finalRows);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const handleTheoryToggle = (id: string, topic: string) => {
    const newValue = !theoryCompleted[id];
    setTheoryCompleted((prev) => ({ ...prev, [id]: newValue }));
    updateTheoryStatus(userId, topic, newValue);
  };

  const getRowClass = (row: any) => {
    if (row.format === "Теорія") {
      return theoryCompleted[row.id] ? "table-success" : "table-danger";
    } else {
      if (row.status === "green") return "table-success";
      if (row.status === "yellow") return "table-warning";
      if (row.status === "red") return "table-danger";
      return "";
    }
  };

  const anchorRef = useRef<HTMLAnchorElement>(null);
  const handleClick = () => {
    if (anchorRef.current) {
      anchorRef.current.click();
    }
  };

  if (loading) return <p>Завантаження даних...</p>;
  if (error) return <p>Помилка: {error}</p>;

  return (
    <div className="container my-4">
      <h1 className="fw-bold text-primary text-center mb-4">Ваш індивідуальний навчальний план</h1>
      <div>
        <h2>Інформація про план</h2>
        {userPlanData?.plan ? (
          <>
            <p>Дата початку: {new Date(userPlanData.plan.startDate).toLocaleDateString()}</p>
            <p>Поточна дата: {new Date(userPlanData.currentDate).toLocaleDateString()}</p>
            <p>Кінцева дата: {new Date(userPlanData.plan.endDate).toLocaleDateString()}</p>
            <p>Годин на тиждень: {userPlanData.plan.hours}</p>
          </>
        ) : (
          <p>План відсутній</p>
        )}
      </div>
      <div>
        <h2>Список тем</h2>
        <table className="table table-sm align-middle">
          <thead>
            <tr className="table-light text-center">
              <th className="text-start">Тема</th>
              <th className="text-center">Кількість годин</th>
              <th className="text-center">Виконано / Всього завдань</th>
              <th className="text-center">Формат</th>
            </tr>
          </thead>
          <tbody>
            {planRows.map((row, idx) => (
              <tr key={idx} className={getRowClass(row)}>
                <td className="text-start">
                  {row.title}
                  {row.format === "Теорія" && (
                    <>
                      {" "}
                      <input
                        type="checkbox"
                        checked={!!theoryCompleted[row.id]}
                        onChange={() => handleTheoryToggle(row.id, row.title)}
                      />
                    </>
                  )}
                </td>
                <td className="text-center">{row.hours}</td>
                <td className="text-center">
                  {row.completedTasks} / {row.taskCount}
                </td>
                <td className="text-center">{row.format}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Прихований лінк для переходу через useRef */}
      <a href="/ind_plan_test_mode" ref={anchorRef} style={{ display: "none" }}>
        Вперед до навчання
      </a>
      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-primary" onClick={handleClick}>
          Вперед до навчання
        </button>
      </div>
      <style jsx>{`
        .custom-button {
          height: 60px;
          width: 200px;
          font-size: 1.2rem;
          border-radius: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          transition: background-color 0.3s;
        }
        .custom-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
}
