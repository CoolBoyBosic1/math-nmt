// Надсилає відповідь на сервер, щоб вона потрапила в прогрес і список помилок.
// Не блокує тест: якщо збереження не вдалося, учень просто продовжує.
export function saveAttempt(taskID: string, answer: unknown): void {
  fetch('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskID, answer }),
  }).catch((err) => console.error('Не вдалося зберегти відповідь:', err));
}
