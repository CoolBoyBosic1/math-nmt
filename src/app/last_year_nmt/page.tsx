"use client";

import Link from "next/link";

// link: null — тест ще не додано в базу (є зображення лише основних сесій 2022–2024)
type Session = { name: string; link: string | null };

export default function PastNMTPage() {
  const years: { year: number; sessions: Session[] }[] = [
    { year: 2024, sessions: [
      { name: "основна сесія", link: "/test_mode/6a7b3225-93ec-4998-8844-cfb2d319688d" },
      { name: "додаткова сесія", link: null },
      { name: "демоваріант", link: null }
    ] },
    { year: 2023, sessions: [
      { name: "основна сесія", link: "/test_mode/66a6f7f2-1920-44e5-ac8f-b17df9ec0c71" },
      { name: "додаткова сесія", link: null },
      { name: "демоваріант", link: null }
    ] },
    { year: 2022, sessions: [
      { name: "основна сесія", link: "/test_mode/3a59f843-b695-4442-9e83-befebd428660" },
      { name: "додаткова сесія", link: null },
      { name: "демоваріант", link: null }
    ] },
    { year: 2021, sessions: [
      { name: "основна сесія", link: null },
      { name: "додаткова сесія", link: null },
      { name: "демоваріант", link: null }
    ] }
  ];

  return (
    <div className="container mt-5">
      {/* Заголовок сторінки */}
      <header className="mb-4 text-center">
        <h1 className="fw-bold text-primary">НМТ минулих років</h1>
        <p className="text-muted">
          Оберіть рік і сесію, для проходження тесту.
        </p>
      </header>

      {/* Список років та сесій */}
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {years.map((yearData) => (
          <div className="col" key={yearData.year}>
            <div
              className="card border-0 shadow-sm p-3 d-flex flex-column align-items-center justify-content-center text-center"
              style={{ height: "100%" }}
            >
              <h2 className="fw-bold text-primary mb-4">{yearData.year}</h2>
              <div className="d-flex flex-column gap-3">
                {yearData.sessions.map((session, index) => session.link === null ? (
                  <button
                    key={index}
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                    style={{ width: "300px", height: "100px", fontSize: "1rem" }}
                    disabled
                  >
                    {session.name} · незабаром
                  </button>
                ) : (
                  <Link
                    key={index}
                    href={session.link}
                    passHref
                    style={{ textDecoration: "none" }}
                  >
                    <button
                      className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                      style={{
                        width: "300px", // Ширина кнопки
                        height: "100px", // Висота кнопки
                        fontSize: "1rem", // Розмір тексту
                      }}
                    >
                      {session.name}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}