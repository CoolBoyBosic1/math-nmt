"use client";

import { useEffect, useState } from "react";

interface Theory {
  id: string;
  title: string;
  // API повертає одну теорію на тему (зв'язок 1:1) або null
  Theory: { content: string } | { content: string }[] | null;
}

export default function TheoryPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const [theory, setTheory] = useState<Theory | null>(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await paramsPromise;
      setParams(resolvedParams);
    }
    unwrapParams();
  }, [paramsPromise]);

  useEffect(() => {
    if (!params) return;
    async function fetchTheory() {
      try {
        const res = await fetch(`/api/topics/${params.id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Не вдалося завантажити тему");
        const data = await res.json();
        setTheory(data);
      } catch (error) {
        console.error("Помилка завантаження теми:", error);
        setTheory(null);
      } finally {
        setLoading(false);
      }
    }
    fetchTheory();
  }, [params]);

  if (loading) return <p className="text-center fs-4 fw-bold mt-5">Завантаження...</p>;
  if (!theory) return <p className="text-center fs-4 fw-bold mt-5">Теорія не знайдена</p>;

  const { title } = theory;
  const theoryContent = theory.Theory == null ? [] : Array.isArray(theory.Theory) ? theory.Theory : [theory.Theory];
  const paragraphs = theoryContent.flatMap((item) => item.content.split("\n")).filter(Boolean);

  return (
    <div className="p-4">
      <h2 className="fw-bold mb-4 text-primary text-center">{title}</h2>

      <div className="space-y-4 w-4/5 mx-auto">
        {paragraphs.length === 0 ? (
          <p className="text-center text-muted">Теорія для цієї теми ще готується.</p>
        ) : (
          <div className="bg-white p-4 rounded shadow">
            {paragraphs.map((line, index) => (
              <p key={index} className="text-gray-700">{line}</p>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center mt-5">
        <a
          href={`/test_mode/${theory.id}`}
          className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center"
          style={{ height: "100px", width: "300px" }}
        >
          До задач
        </a>
      </div>
    </div>
  );
}
  