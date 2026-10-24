"use client";

import Confetti from "react-confetti";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import useUnsavedChangesWarning from "../routerWarning";
import { Task, MultipleLettersAnswer } from "../types";
import { getAnswerType,  checkSingleLetterAnswer,  checkMultipleLettersAnswer, 
  checkNumberAnswer, checkIfTimerNeeded,  formatTime,  handleTestCompletion 
} from "../utils";
import { TaskImage } from "../../ui/test_mode/taskImage";
import { AnswerButtons } from "../../ui/test_mode/answerButtons";
import { ControlButtons } from "../../ui/test_mode/controlButtons";
import { PageHeader } from "../../ui/test_mode/pageHeader";
import '../style.css';

export default function TestModePage() {
  const params = useParams();
  const topicId = params?.id as string;
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answer, setAnswer] = useState<string | MultipleLettersAnswer>("");
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 1 година в секундах
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null); // Час початку тесту
  const [shouldUseTimer, setShouldUseTimer] = useState(false); // Флаг для використання таймера
  const [results, setResults] = useState<{correct: number, total: number}>({correct: 0, total: 0});
  const [showImages, setShowImages] = useState(false);

  const options = ["А", "Б", "В", "Г", "Д"];

  // Завантаження завдань
  useEffect(() => {
    if (!topicId) {
      setError("ID теми не знайдено в URL");
      setLoading(false);
      return;
    }
    async function fetchTasks() {
      try {
        const res = await fetch(`/api/topics/${topicId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Статус: ${res.status}`);
        
        const data = await res.json();
        if (!data.Task) throw new Error("Немає завдань");
        
        // Отримуємо title теми
        setTitle(data.title);

        // Перевіряємо умову для таймера
        const timerNeeded = checkIfTimerNeeded(data.title);
        setShouldUseTimer(timerNeeded);

        // Сортування
        const sortedTasks = [...data.Task].sort((a: Task, b: Task) => {
          // Визначаємо пріоритет типів
          const getTypePriority = (type: string, answer: string) => {
            if (type === "ONE") {
              return /^[A-Za-zА-Яа-яЄєІіЇїҐґ]$/.test(answer) ? 1 : 3;
            } else if (type === "MATCH") {
              return 2;
            } else {
              return 4;
            }
          };
          const priorityA = getTypePriority(a.type, a.answer);
          const priorityB = getTypePriority(b.type, b.answer);
          return priorityA - priorityB;
        });

        setResults(prev => ({...prev, total: sortedTasks.length}));
        setTasks(sortedTasks);

        if (timerNeeded) {
          setTimerActive(true);
          setStartTime(Date.now());
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [topicId]);

  useUnsavedChangesWarning(timerActive);

  // Логіка таймера
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      // Час вичерпано - перенаправляємо на сторінку результатів
      handleTestCompletion({startTime, shouldUseTimer, topicId, results, router});
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Відображення конфеті
  const [numPieces, setNumPieces] = useState(300);
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;

    if (showConfetti) {
      document.body.style.overflowX = 'hidden';
      setNumPieces(300);
      setOpacity(1);

      timeout1 = setTimeout(() => {
        setOpacity(0);
        timeout2 = setTimeout(() => {
          setNumPieces(0);
          setShowConfetti(false);
        }, 2000);
      }, 2000);
    } else {
      document.body.style.overflowX = 'auto';
    }
    return () => {
      document.body.style.overflowX = 'auto';
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [showConfetti]);

  // Отримання типу поточного завдання та відповідей
  const currentTask = tasks[currentTaskIndex];
  // Ініціалізація відповіді при зміні завдання
  useEffect(() => {
    if (!currentTask) return;
    
    const answerType = getAnswerType(currentTask);
    
    if (answerType === 'multipleLetters') {
      try {
        const correctAnswerParsed = JSON.parse(currentTask.answer) as MultipleLettersAnswer;
        const initialAnswer = Object.keys(correctAnswerParsed).reduce(
          (acc, key) => ({ ...acc, [key]: '' }), 
          {} as MultipleLettersAnswer
        );
        setAnswer(initialAnswer);
      } catch (e) {
        setAnswer("");
      }
    } else {
      setAnswer("");
    }
  }, [currentTaskIndex, tasks]);

  // Перехід до наступного завдання
  const handleNextTask = () => {
    const isLastTask = currentTaskIndex === tasks.length - 1;
     if (isLastTask) {
       // Перехід на сторінку результатів
       handleTestCompletion({startTime, shouldUseTimer, topicId, results, router});
     } else {
       setSubmitted(false);
       setShowSolution(false);
       setCurrentTaskIndex(prev => prev + 1);

       //для кнопки "назад"
       //window.history.replaceState(null, "", window.location.pathname);
     }
  };

  // Перевірка відповіді
  const handleSubmit = () => {
    if (!submitted && currentTask) {
      const currentAnswer = currentTask.answer;
      const answerType = getAnswerType(currentTask);
      
      let calculatedIsCorrect = false;
      
      switch (answerType) {
        case 'singleLetter':
          calculatedIsCorrect = checkSingleLetterAnswer(answer as string, currentAnswer);
          break;
        case 'multipleLetters': {
          try {
            const correctAnswerParsed = JSON.parse(currentAnswer) as MultipleLettersAnswer;
            calculatedIsCorrect = checkMultipleLettersAnswer(
              answer as MultipleLettersAnswer, 
              correctAnswerParsed
            );
          } catch (e) {
            calculatedIsCorrect = false;
          }
          break;
        }
        case 'number':
          calculatedIsCorrect = checkNumberAnswer(answer as string, currentAnswer);
          break;
      }

      setSubmitted(true);
      if (calculatedIsCorrect) {
        setShowConfetti(true);
        setResults(prev => ({...prev, correct: prev.correct + 1}));
      }
    } else {
      handleNextTask();
    }
  };

  if (loading) return <p className="text-center fs-4 fw-bold mt-5">Завантаження...</p>;
  if (error) return <p className="text-center fs-4 fw-bold text-danger mt-5">Помилка: {error}</p>;
  if (!tasks.length) return <p className="text-center fs-4 fw-bold mt-5">Завдання не знайдені</p>;

  const answerType = getAnswerType(currentTask);
  const canSubmit = !!answer && (typeof answer !== 'object' || Object.values(answer).some(v => !!v));

    // Визначаємо, чи це останнє завдання
   const isLastTask = currentTaskIndex === tasks.length - 1;

  return (
    <div className="d-flex flex-column justify-content-between min-vh-100">
      {showConfetti && (
        <Confetti 
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={numPieces}
          gravity={0.5}
          recycle={false}
          style={{ 
            opacity: opacity, 
            transition: "opacity 2s ease-out",
            pointerEvents: 'none' // Для ігнорування кліків
          }}
        />
      )}
      <main className="flex-grow-1">
        <div className="container py-4">
        <PageHeader 
            title={title}
            currentTaskIndex={currentTaskIndex}
            totalTasks={tasks.length}
            timeLeft={timeLeft}
            shouldUseTimer={shouldUseTimer}
            formatTime={formatTime}
          />

          <div className="row justify-content-center">
            <div className="col-md-8 d-flex flex-column align-items-center text-center">
              {currentTask?.problem && (
                <TaskImage 
                  src={currentTask.problem} 
                  alt="Завдання" 
                />
              )}

              {showSolution && currentTask?.solution && (
                <TaskImage 
                  src={currentTask.solution} 
                  alt="Розв'язок" 
                  width={258}
                  height={172}
                  disableHover={true}
                />
              )}
            </div>
          </div>

          <div className="row justify-content-center mt-2">
            <div className="col-auto">
              <AnswerButtons 
                type={answerType}
                options={options}
                answer={answer}
                correctAnswer={currentTask.answer}
                submitted={submitted}
                onAnswerChange={setAnswer}
              />
            </div>
          </div>

          <ControlButtons 
            onSkip={handleNextTask}
            onSubmit={handleSubmit}
            onShowSolution={() => setShowSolution(!showSolution)}
            submitted={submitted}
            canSubmit={canSubmit}
            showSolution={showSolution}
            isLastTask={isLastTask}
            nextButtonText={submitted && isLastTask ? "Завершити" : (submitted ? "Далі" : "Відповісти")}
          />
          <div className="text-center">
            <button
              className="btn fw-bold d-flex align-items-center justify-content-center mx-auto border-0 text-dark"
              onClick={() => setShowImages(!showImages)}
              style={{ fontSize: "1.2rem" }}
            >
              <span className="me-2">{showImages ? "▾" : "▸"}</span> Додаткові матеріали
            </button>
            
            {showImages && (
              <div className="d-flex flex-column align-items-center mt-3">
                <img 
                  src="/images/additional_materials/1.jpg" className="mb-2 img-fluid" alt="Матеріал 1" 
                  style={{ width: "70%", maxWidth: "100%", transition: "width 0.3s ease"}} 
                />
                <img 
                  src="/images/additional_materials/2.jpg" className="mb-2 img-fluid" alt="Матеріал 2" 
                  style={{ width: "70%", maxWidth: "100%", transition: "width 0.3s ease"}} 
                />
                <img 
                  src="/images/additional_materials/3.jpg" className="mb-2 img-fluid" alt="Матеріал 3" 
                  style={{ width: "70%", maxWidth: "100%", transition: "width 0.3s ease"}} 
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}