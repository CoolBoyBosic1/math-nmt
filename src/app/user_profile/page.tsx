"use client";

import React, { useState } from "react";
import { User, AlertTriangle, BookOpen, ChevronRight, ChevronDown } from "lucide-react";

interface Subtopic {
  name: string;
  progress: number;
  subtopics?: Subtopic[];
}
/*
interface Topic {
  name: string;
  progress: number;
  subtopics: Subtopic[];
}*/

const topics = [
  {
    name: "Алгебра і початки аналізу",
    progress: 75,
    subtopics: [
      {
        name: "Цілі числа і вирази",
        progress: 80,
        subtopics: [
          { name: "Дійсні числа", progress: 10 },
          { name: "Відношення та пропорції", progress: 20 },
          { name: "Показникові, логарифмічні вирази", progress: 30 },
          { name: "Раціональні, ірраціональні числа", progress: 40 }
        ],
      },
      {
        name: "Рівняння нерівності та їхні системи",
        progress: 50,
        subtopics: [
          { name: "Лінійні, квадратні, раціональні рівняння та системи рівнянь", progress: 60 },
          { name: "Ірраціональні, тригонометричні рівняння та системи рівнянь", progress: 70 },
          { name: "Показникові, логарифмічні рівняння та системи рівнянь", progress: 80 },
          { name: "Нерівності та системи нерівностей", progress: 90 },
          { name: "Розв’язування задач за допомогою рівнянь і систем рівнянь", progress: 100 },
        ],
      },
      {
        name: "Функції",
        progress: 0,
        subtopics: [
          { name: "Числові послідовності", progress: 7 },
          { name: "Функціональна залежність", progress: 5 },
          { name: "Лінійні та квадратні функції", progress: 6 },
          { name: "Степеневі, показникові, логарифмічні та тригонометричні функції", progress: 7 },
          { name: "Похідна функції", progress: 8 },
          { name: "Первісна та визначений інтеграл", progress: 9 }
        ],
      },
      {
        name: "Комбінаторика, теорія ймовірностейб статистика",
        progress: 10,
        subtopics: [
          { name: "Перестановки, комбінації, розміщення. Комбінаторні правила суми та добутку", progress: 90 },
          { name: "Ймовірність випадкової події. Вибіркові характеристики", progress: 70 },
        ],
      }
    ],
  },
  {
    name: "Геометрія",
    progress: 60,
    subtopics: [
      {
        name: "Планіметрія",
        progress: 70,
        subtopics: [
          { name: "Елементарні геометричні фігури на площині. Геометричні величини", progress: 80 },
          { name: "Трикутники", progress: 80 },
          { name: "Паралелограм. Ромб. Трапеція", progress: 80 },
          { name: "Прямокутник. Квадрат", progress: 80 },
          { name: "Коло та круг. Многокутники", progress: 80 },
          { name: "Координати та вектори на площині. Геометричні переміщення", progress: 80 },
        ],
      },
      {
        name: "Стереометрія",
        progress: 70,
        subtopics: [
          { name: "Прямі та площини у просторі", progress: 80 },
          { name: "Призма", progress: 80 },
          { name: "Піраміда", progress: 80 },
          { name: "Тіла обертання", progress: 80 },
          { name: "Координати та вектори у просторі", progress: 80 }
        ],
      }
    ],
  },
];

interface NavigationCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ icon: Icon, title, description, href }) => (
  <div className="group relative w-full md:w-96 h-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
    <a href={href} className="absolute inset-0 no-underline">
      <div className="p-6 h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 no-underline">{title}</h3>
        <p className="text-gray-600 text-sm no-underline">{description}</p>
        <span className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform duration-300 no-underline">
          Переглянути
          <ChevronRight className="w-4 h-4 ml-2" />
        </span>
      </div>
    </a>
  </div>
);

const ProfilePage: React.FC = () => {
  const [expandedTopics, setExpandedTopics] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (topicName: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicName]: !prev[topicName] }));
  };

  const getProgressColor = (progress: number): string => {
    const r = Math.max(255 - progress * 2.55, 0);
    const g = Math.min(progress * 2.55, 255);
    return `rgb(${r}, ${g}, 0)`;
  };

  const renderSubtopics = (subtopics: Subtopic[]) => {
    return subtopics.map((sub, index) => (
      <div key={index} className="ms-4">
        <div className="d-flex align-items-center cursor-pointer" onClick={() => toggleExpand(sub.name)}>
          {expandedTopics[sub.name] && sub.subtopics ? <ChevronDown size={16} className="me-2" /> : sub.subtopics ? <ChevronRight size={16} className="me-2" /> : null}
          <h6 className="text-dark mb-1">{sub.name}</h6>
        </div>
        <div className="progress mt-2 mb-3">
          <div className="progress-bar" role="progressbar" style={{ width: `${sub.progress}%`, backgroundColor: getProgressColor(sub.progress) }}>
            {sub.progress}%
          </div>
        </div>
        {expandedTopics[sub.name] && sub.subtopics && renderSubtopics(sub.subtopics)}
      </div>
    ));
  };

  return (
    <div className="container py-5">
      <div className="row align-items-start">
        <div className="col-md-4 d-flex flex-column gap-4">
          <NavigationCard icon={User} title="Профіль користувача" description="Редагуйте свій профіль" href="/edit_profile" />
          <NavigationCard icon={AlertTriangle} title="Мої помилки" description="Вирішите задачі, у яких ви зробили помилки" href="/my_mistakes" />
          <NavigationCard icon={BookOpen} title="Мій навчальний план" description="Персоналізований план навчання для вас" href="/personal_program_registered" />
        </div>
        <div className="col-md-8">
          <h3 className="fw-bold text-dark mt-3 mb-4">Прогрес за темами</h3>
          {topics.map((topic, index) => (
            <div key={index} className="mb-4">
              <div className="d-flex align-items-center cursor-pointer" onClick={() => toggleExpand(topic.name)}>
                {expandedTopics[topic.name] ? <ChevronDown size={16} className="me-2" /> : <ChevronRight size={16} className="me-2" />}
                <h5 className="text-dark mb-2">{topic.name}</h5>
              </div>
              <div className="progress mt-3 mb-4">
                <div className="progress-bar" role="progressbar" style={{ width: `${topic.progress}%`, backgroundColor: getProgressColor(topic.progress) }}>
                  {topic.progress}%
                </div>
              </div>
              {expandedTopics[topic.name] && topic.subtopics && renderSubtopics(topic.subtopics)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
