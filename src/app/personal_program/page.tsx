"use client";

import { useState } from "react";
import "../styles/styles.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEMO_USER_ID } from "@/lib/demo";
import { MIN_HOURS, MAX_HOURS, MIN_DAYS } from "@/lib/validator/plan";

export default function PersonalPlanPage() {
  const router = useRouter();
  const [hoursNumber, setHoursNumber] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckbox, setShowCheckbox] = useState(true);
  const [showTestWarning, setShowTestWarning] = useState(false); // Для відображення попередження

  const validateHours = (hours: number) => {
    if (isNaN(hours)) return "Введіть коректну кількість годин";
    if (hours < MIN_HOURS || hours > MAX_HOURS) return `Число має бути від ${MIN_HOURS} до ${MAX_HOURS}`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Якщо користувач не відмовився від тесту, показуємо попередження
    if (showCheckbox) {
      setShowTestWarning(true);
      return;
    }

    // Валідація
    const hoursError = validateHours(Number(hoursNumber));
    if (hoursError) return setError(hoursError);
    
    if (!endDate) return setError("Оберіть дату завершення");
    const earliest = new Date();
    earliest.setDate(earliest.getDate() + MIN_DAYS);
    if (new Date(endDate) < earliest) return setError(`Дата має бути щонайменше через ${MIN_DAYS} днів`);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours: Number(hoursNumber),
          endDate: new Date(endDate).toISOString(),
          userID: DEMO_USER_ID // TODO (Sprint 5): брати ID із сесії
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Помилка при створенні плану");
      }

      router.push("/personal_program_registered");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Невідома помилка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-between min-vh-100">
      <header className="bg-white py-5 border-bottom">
        <div className="container px-5 text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="lead text-dark mb-4">
                Швидкий тест у форматі НМТ забезпечить вам персоналізований план
                під ваші теперішні знання
              </h2>
              <div className="d-flex justify-content-center mb-3">
              <Link
                 href="/test_mode"
                 className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center"
                 style={{
                   height: "100px",
                   width: "300px",
                   fontSize: "1.2rem",
                   textAlign: "center",
                 }}
               >
                 Пройти швидкий тест
               </Link>
              </div>

              {showCheckbox && (
                <div className="d-flex align-items-center justify-content-center mt-3">
                  <input
                    type="checkbox"
                    id="skipTest"
                    className="form-check-input"
                    onChange={() => setShowCheckbox(!showCheckbox)}
                  />
                  <label htmlFor="skipTest" className="form-check-label">
                    Відмовляюсь проходити швидкий тест
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
            <div className="mb-4 text-center">
              <label
                htmlFor="hours"
                className="lead text-dark d-block mb-2"
                style={{ width: "300px", textAlign: "center" }}
              >
                Скільки годин на тиждень ви маєте можливість займатись?
              </label>
              <input
                id="hours"
                type="number"
                placeholder="Введіть кількість годин"
                value={hoursNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[0-9]{0,3}$/.test(value)) {
                    setHoursNumber(value);
                    setError(null);
                  }
                }}
                className="form-control mx-auto"
                style={{ width: "300px", fontSize: "1rem", textAlign: "center" }}
                min={MIN_HOURS}
                max={MAX_HOURS}
              />
            </div>

            <div className="mb-4 text-center">
              <label
                htmlFor="endDate"
                className="lead text-dark d-block mb-2"
                style={{ width: "300px", textAlign: "center" }}
              >
                Виберіть дату завершення навчання
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control mx-auto"
                style={{ width: "300px", fontSize: "1rem", textAlign: "center" }}
              />
            </div>

            {error && (
              <div className="text-danger mb-3">
                <p>{error}</p>
              </div>
            )}

            {showTestWarning && (
              <div className="text-warning mb-3">
                <p>Рекомендуємо пройти швидкий тест для кращої персоналізації плану</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center"
              style={{
                width: "300px",
                height: "100px",
                fontSize: "1.2rem",
              }}
            >
              {isLoading ? "Створення..." : "Створити план"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// "use client";
// import { useState } from "react";
// import "../styles/styles.css";
// import { useRouter } from "next/navigation";

// export default function PersonalPlanPage() {
//   const router = useRouter();
//   const [hoursNumber, setHoursNumber] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [error, setError] = useState<null | string>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const validateHours = (hours: number) => {
//     if (isNaN(hours)) return "Введіть коректну кількість годин";
//     if (hours < 0 || hours > 168) return "Число має бути від 0 до 168";
//     return null;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Валідація
//     const hoursError = validateHours(Number(hoursNumber));
//     if (hoursError) return setError(hoursError);
    
//     if (!endDate) return setError("Оберіть дату завершення");
//     if (new Date(endDate) < new Date()) return setError("Дата має бути у майбутньому");

//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/plans", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           hours: Number(hoursNumber),
//           endDate: new Date(endDate).toISOString(),
//           userID: "temp-user-id" // TODO: Замінити на реальний ID з авторизації
//         })
//       });

//       if (!response.ok) {
//         const data = await response.json();
//         throw new Error(data.error || "Помилка при створенні плану");
//       }

//       router.push("/personal/dashboard");
//     } catch (error) {
//       setError(error instanceof Error ? error.message : "Невідома помилка");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="d-flex flex-column justify-content-between min-vh-100">
//       <header className="bg-white py-5 border-bottom">
//         <div className="container px-5 text-center">
//           <div className="row justify-content-center">
//             <div className="col-lg-8">
//               <h2 className="lead text-dark mb-4">
//                 Швидкий тест у форматі НМТ забезпечить вам персоналізований план
//                 під ваші теперішні знання
//               </h2>
//               <div className="d-flex justify-content-center mb-3">
//                 <a
//                   href="/quick_test"
//                   className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center"
//                   style={{
//                     height: "100px",
//                     width: "300px",
//                     fontSize: "1.2rem",
//                     textAlign: "center",
//                   }}
//                 >
//                   Пройти швидкий тест
//                 </a>
//               </div>

//               {showCheckbox && (
//                 <div className="d-flex align-items-center justify-content-center mt-3">
//                   <input
//                     type="checkbox"
//                     id="skipTest"
//                     className="form-check-input"
//                   />
//                   <label htmlFor="skipTest" className="form-check-label">
//                     Відмовляюсь проходити швидкий тест
//                   </label>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="flex-grow-1 d-flex justify-content-center align-items-center">
//         <div className="text-center">
//           <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
//             <div className="mb-4 text-center">
//               <label
//                 htmlFor="hours"
//                 className="lead text-dark d-block mb-2"
//                 style={{ width: "300px", textAlign: "center" }}
//               >
//                 Скільки годин на тиждень ви маєте можливість займатись?
//               </label>
//               <input
//                 id="hours"
//                 type="number"
//                 placeholder="Введіть кількість годин"
//                 value={hoursNumber}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value === "" || /^[0-9]{0,3}$/.test(value)) {
//                     setHoursNumber(value);
//                     setError(null);
//                   }
//                 }}
//                 className="form-control mx-auto"
//                 style={{ width: "300px", fontSize: "1rem", textAlign: "center" }}
//                 min="0"
//                 max="168"
//               />
//             </div>

//             <div className="mb-4 text-center">
//               <label
//                 htmlFor="endDate"
//                 className="lead text-dark d-block mb-2"
//                 style={{ width: "300px", textAlign: "center" }}
//               >
//                 Виберіть дату завершення навчання
//               </label>
//               <input
//                 id="endDate"
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="form-control mx-auto"
//                 style={{ width: "300px", fontSize: "1rem", textAlign: "center" }}
//               />
//             </div>

//             {error && (
//               <div className="text-danger mb-3">
//                 <p>{error}</p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center"
//               style={{
//                 width: "300px",
//                 height: "100px",
//                 fontSize: "1.2rem",
//               }}
//             >
//               {isLoading ? "Створення..." : "Створити план"}
//             </button>
//           </form>
//         </div>
//       </main>
//     </div>
//   );
// }
