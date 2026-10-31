"use client";

import { Suspense } from "react";
 
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
 
function ResultsPageContent() {
  const searchParams = useSearchParams();
  
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const topicId = searchParams.get('topicId');
  const correct = parseInt(searchParams.get('correct') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const timeParam = searchParams.get('time');
  const completionTime = timeParam ? parseInt(timeParam) : null;  // Час проходження тесту
  // number of correct answers
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  // test result
  const getResultMessage = () => {
    if (percentage >= 90) return "Відмінно! Ви чудово засвоїли матеріал!";
    if (percentage >= 75) return "Добре! Ви маєте хороше розуміння теми.";
    if (percentage >= 60) return "Непогано. Але варто потренуватись ще.";
    return "Потрібно більше практики. Спробуйте пройти тест ще раз.";
  };
  
  // Форматування часу
  const formatCompletionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let formattedTime = '';
    if (hours > 0) {
      formattedTime += `${hours} год `;
    }
    if (minutes > 0 || hours > 0) {
      formattedTime += `${minutes} хв `;
    }
    formattedTime += `${remainingSeconds} сек`;
    
    return formattedTime;
  };
  
  useEffect(() => {
    if (!topicId) {
      setTitle("Швидкий тест");
      setLoading(false);
      return;
    }
    
    // topic
    const fetchTopicTitle = async () => {
      try {
        const res = await fetch(`/api/topics/${topicId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Статус: ${res.status}`);
        
        const data = await res.json();
        setTitle(data.title || "Невідома тема");
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopicTitle();
  }, [topicId]);

  // color
  const getPercentageClass = () => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 75) return "text-primary";
    if (percentage >= 60) return "text-warning";
    return "text-danger";
  };
  
  if (loading) return <p className="text-center fs-4 fw-bold mt-5">Завантаження результатів...</p>;
  if (error) return <p className="text-center fs-4 fw-bold text-danger mt-5">Помилка: {error}</p>;
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="text-center mb-0">Результати тестування</h2>
            </div>
            
            <div className="card-body py-4">
              <h3 className="text-center mb-4">Тема: {title}</h3>
              
              <div className="text-center mb-4">
                <div className="display-1 fw-bold mb-3">
                  <span className={getPercentageClass()}>{percentage}%</span>
                </div>
                
                <div className="progress mb-3" style={{ height: '30px' }}>
                  <div 
                    className={`progress-bar ${percentage >= 75 ? 'bg-success' : percentage >= 60 ? 'bg-warning' : 'bg-danger'}`} 
                    role="progressbar" 
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={percentage} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  >
                    {percentage}%
                  </div>
                </div>
                
                <h4 className="mb-3">
                  Правильних відповідей: <strong>{correct}</strong> з <strong>{total}</strong>
                </h4>
                
                {completionTime !== null && (
                  <h5 className="mb-3">
                    Час проходження: <strong>{formatCompletionTime(completionTime)}</strong>
                  </h5>
                )}
                
                <p className="fs-5 mb-4">{getResultMessage()}</p>
              </div>
              
              {/* <div className="d-flex justify-content-center gap-3"> */}
              <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
              {topicId ? (
                  <Link href={`/test_mode/${topicId}`} className="btn btn-primary btn-lg">
                    Спробувати ще раз
                  </Link>
                ) : (
                  <Link href="/test_mode?fromPage=/" className="btn btn-primary btn-lg">
                    Спробувати ще раз
                  </Link>
                )}
                <Link href="/" className="btn btn-outline-primary btn-lg">
                  На головну
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// useSearchParams потребує Suspense для збірки Next.js 15
export default function ResultsPage() {
  return (
    <Suspense fallback={<p className="text-center mt-5">Завантаження...</p>}>
      <ResultsPageContent />
    </Suspense>
  );
}
