"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TestModePage() {
  const { topicId } = useParams();

  // Якщо topicId відсутній, виводимо повідомлення (до виклику інших хуків)
  if (!topicId) {
    return (
      <p>
        Не задано ID теми. Переконайтеся, що перехід здійснюється із плану, який містить тему.
      </p>
    );
  }

  return <TestModeContent topicId={String(topicId)} />;
}

function TestModeContent({ topicId }: { topicId: string }) {
  const router = useRouter();

  // Локальний стан компонента
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Приклад варіантів відповіді
  const options = ["А", "Б", "В", "Г", "Д"];

  // Завантаження завдань за допомогою useEffect
  useEffect(() => {
    async function fetchTasks() {
      try {
        // Формуємо URL до API з використанням topicId.
        // Файл API має бути розташований за шляхом app/api/topics/[topicId]/route.ts
        const url = `/api/topics/${topicId}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Не вдалося завантажити завдання. Статус: ${res.status}`);
        }
        const data = await res.json();

        // Перевіряємо наявність масиву Task у відповіді
        if (!data.Task || !Array.isArray(data.Task)) {
          throw new Error("Неправильний формат даних: відсутній масив Task");
        }
        // Сортуємо завдання за необхідністю (наприклад, за алфавітом відповіді)
        const sortedTasks = [...data.Task].sort((a, b) =>
          a.answer.localeCompare(b.answer, undefined, { numeric: true })
        );
        setTasks(sortedTasks);
      } catch (err: any) {
        console.error("Помилка завантаження завдань:", err);
        setError(`Помилка: ${err.message}`);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [topicId]);

  // Функція для вибору відповіді
  const handleAnswerSelect = (option: string) => setAnswer(option);

  // Перехід до наступного завдання
  const handleNextTask = () => {
    setAnswer("");
    setSubmitted(false);
    setShowSolution(false);
    // Зациклюємо список завдань
    setCurrentTaskIndex((prevIndex) => (prevIndex + 1) % tasks.length);
  };

  // Обробка кнопки "Відповісти" / "Далі"
  const handleSubmit = () => {
    if (!submitted) {
      setSubmitted(true);
      if (answer === tasks[currentTaskIndex].answer) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      handleNextTask();
    }
  };

  if (loading) return <p>Завантаження завдань...</p>;
  if (error) return <p>{error}</p>;
  if (tasks.length === 0) return <p>Завдання не знайдені.</p>;

  const currentTask = tasks[currentTaskIndex];

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Режим тестування</h1>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Відображаємо ID теми */}
        <h4>Тема: {topicId}</h4>
        <h5>{`Завдання ${currentTaskIndex + 1} з ${tasks.length}`}</h5>
      </div>
      <div className="row justify-content-center mb-4">
        <div className="col-md-8 text-center">
          {currentTask && currentTask.problem ? (
            <img
              src={`/${currentTask.problem}`}
              alt="Завдання"
              width={600}
              height={400}
              className={`img-fluid ${hovered ? "hovered" : ""}`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            />
          ) : (
            <p>Зображення завдання відсутнє</p>
          )}
          {showSolution && currentTask && currentTask.solution && (
            <img
              src={`/${currentTask.solution}`}
              alt="Розв'язок"
              width={600}
              height={400}
              className={`img-fluid mt-2 ${hovered ? "hovered" : ""}`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            />
          )}
        </div>
      </div>
      <div className="row justify-content-center mb-3">
        <div className="col-auto d-flex flex-wrap gap-2">
          {options.map((option, index) => {
            let btnClass = "btn answer-button";
            if (submitted) {
              if (option === currentTask.answer) {
                btnClass += " correct";
              } else if (option === answer) {
                btnClass += " incorrect";
              }
            } else if (option === answer) {
              btnClass += " selected";
            }
            return (
              <button
                key={index}
                className={btnClass}
                onClick={() => handleAnswerSelect(option)}
                disabled={submitted}
                style={{ width: "40px", height: "35px", fontSize: "0.8rem" }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      <div className="row justify-content-center gap-2">
        <div className="col-auto">
          <button className="btn btn-primary custom-button" onClick={handleNextTask}>
            Пропустити
          </button>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary custom-button"
            onClick={handleSubmit}
            disabled={!answer && !submitted}
          >
            {submitted ? "Далі" : "Відповісти"}
          </button>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary custom-button"
            onClick={() => setShowSolution(!showSolution)}
            disabled={!submitted}
          >
            {showSolution ? "Сховати розв'язок" : "Показати розв'язок"}
          </button>
        </div>
      </div>
      <style jsx>{`
        .answer-button {
          color: black;
          background: white;
          border: 1px solid #ccc;
          transition: background-color 0.3s, color 0.3s;
        }
        .answer-button.selected,
        .answer-button:hover {
          background-color: #007bff;
          color: white;
        }
        .answer-button.correct {
          background-color: green !important;
          color: white !important;
        }
        .answer-button.incorrect {
          background-color: red !important;
          color: white !important;
        }
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
        .img-fluid {
          transition: transform 0.5s;
        }
        .img-fluid.hovered {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
