"use client";

import Confetti from "react-confetti";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import useUnsavedChangesWarning from "./routerWarning";
import { Topic, SampledTask, Task, MultipleLettersAnswer } from "./types";
import { checkSingleLetterAnswer } from "./utils";
import { TaskImage } from "../ui/test_mode/taskImage";
import { AnswerButtons } from "../ui/test_mode/answerButtons";
import { ControlButtons } from "../ui/test_mode/controlButtons";
import { PageHeader } from "../ui/test_mode/pageHeader";
import './style.css';

function TestModePageContent() {
  const router = useRouter();

  const [sampledTasks, setSampledTasks] = useState<SampledTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answer, setAnswer] = useState<string | MultipleLettersAnswer>("");
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const searchParams = useSearchParams();
  const fromPage = searchParams.get('fromPage');
  const [results, setResults] = useState<{correct: number, total: number}>({correct: 0, total: 0});

  const options = ["А", "Б", "В", "Г", "Д"];

  // Завантаження всіх тем, фільтрація та подальше завантаження по одному завданню з кожної теми
  useEffect(() => {
    async function fetchTopicsAndSampleTasks() {
      try {
        // отримуємо всі теми
        const topicsRes = await fetch(`/api/topics`, { cache: "no-store" });
        if (!topicsRes.ok) throw new Error(`Статус: ${topicsRes.status}`);
        const allTopics = await topicsRes.json();
        
        // фільтруємо теми
        const filteredTopics = allTopics.filter(
            (topic: Topic) => !((/^(?:\d+|\/\/)/.test(topic.title)) || topic.title == "Швидкий тест")
          );          
        
        // Масив для зберігання завдань із різних тем
        const tasksWithTopics: SampledTask[] = [];
        
        // Послідовно завантажуємо одне завдання з кожної теми
        for (const topic of filteredTopics) {
          try {
            // Завантажуємо деталі теми з завданнями
            const taskRes = await fetch(`/api/topics/${topic.id}`, { cache: "no-store" });
            if (!taskRes.ok) continue;
            
            const topicData = await taskRes.json();
            if (!topicData.Task || topicData.Task.length === 0) continue;
            
            // Шукаємо всі завдання тестового типу
            const eligibleTasks = topicData.Task.filter((task: Task) => 
              task.type === "ONE" && 
              typeof task.answer === "string" && 
              /^[А-ЯІЇЄҐ]$/.test(task.answer)
            );

            // Якщо є підходящі завдання, вибираємо одне випадково
            if (eligibleTasks.length > 0) {
              const randomIndex = Math.floor(Math.random() * eligibleTasks.length);
              const oneTask = eligibleTasks[randomIndex];
            
            if (oneTask) {
              tasksWithTopics.push({
                task: oneTask,
                topic: topic.title,
                topicId: topic.id,
                result: null
              });
            }
          }
          setResults(prev => ({...prev, total: tasksWithTopics.length}));

          } catch (e) {
            console.error(`Помилка завантаження теми ${topic.id}:`, e);
          }
        }
        
        setSampledTasks(tasksWithTopics);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTopicsAndSampleTasks();
  }, []);

  // Зберігаємо попередження про незбережені зміни
  useUnsavedChangesWarning(false);

  // Ефекти конфетті
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

  // Отримуємо поточне завдання
  const currentSampledTask = sampledTasks[currentTaskIndex];
  const currentTask = currentSampledTask?.task;
  
  // Ініціалізуємо відповідь при зміні завдання
  useEffect(() => {
    setAnswer("");
  }, [currentTaskIndex, sampledTasks]);

  // Функція для обробки зміни відповіді
  const handleAnswerChange = (newAnswer: string | MultipleLettersAnswer) => {
    setAnswer(newAnswer);
  };

  // Перехід до наступного завдання
  const handleNextTask = () => {
    // Зберігаємо результат для поточного завдання
    if (currentSampledTask) {
      const updatedTasks = [...sampledTasks];
      const result = submitted ? (checkCorrectness() ? 1 : 0) : 0;
      updatedTasks[currentTaskIndex].result = result;
      setSampledTasks(updatedTasks);
    }
    
    const isLastTask = currentTaskIndex === sampledTasks.length - 1;
    if (isLastTask) {
      if (fromPage === '/') {
        // Перехід з головної
        const timeParam = '';
        router.push(`/result_page?correct=${results.correct}&total=${results.total}${timeParam}`);
      } else {
        // Перехід з створення плану
        router.push('/personal_program');
      }
    } else {
      setSubmitted(false);
      setShowSolution(false);
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  // Перевіряємо чи відповідь правильна
  const checkCorrectness = () => {
    if (!currentTask) return false;
    
    const currentAnswer = currentTask.answer;
    return checkSingleLetterAnswer(answer as string, currentAnswer);
  };

  // Надсилання відповіді
  const handleSubmit = () => {
      if (!submitted && currentTask) {
        const currentAnswer = currentTask.answer;
        
        let calculatedIsCorrect = false;
        calculatedIsCorrect = checkSingleLetterAnswer(answer as string, currentAnswer);

        setSubmitted(true);
        if (calculatedIsCorrect) {
          setShowConfetti(true);
          setResults(prev => ({...prev, correct: prev.correct + 1}));
        }
      } else {
        handleNextTask();
      }
    };

  if (loading) return <p className="text-center fs-4 fw-bold mt-5">Завантаження різноманітних завдань. Будь ласка, зачекайте...</p>;
  if (error) return <p className="text-center fs-4 fw-bold text-danger mt-5">Помилка: {error}</p>;
  if (!sampledTasks.length) return <p className="text-center fs-4 fw-bold mt-5">Завдання не знайдені</p>;

  // Тип завжди singleLetter
  const answerType = 'singleLetter';
  const canSubmit = !!answer;
  const isLastTask = currentTaskIndex === sampledTasks.length - 1;

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
            pointerEvents: 'none'
          }}
        />
      )}
      <main className="flex-grow-1">
        <div className="container py-4">
        <PageHeader
          title={currentSampledTask?.topic || "Тестування"}
          currentTaskIndex={currentTaskIndex}
          totalTasks={sampledTasks.length}
          shouldUseTimer={false}
          timeLeft={0}
          formatTime={(time) => ""}
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
              {currentTask && (
                <AnswerButtons
                type={answerType}
                options={options}
                answer={answer}
                correctAnswer={currentTask.answer}
                submitted={submitted}
                onAnswerChange={handleAnswerChange}
              />
              )}
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

// useSearchParams потребує Suspense для збірки Next.js 15
export default function TestModePage() {
  return (
    <Suspense fallback={<p className="text-center mt-5">Завантаження...</p>}>
      <TestModePageContent />
    </Suspense>
  );
}
