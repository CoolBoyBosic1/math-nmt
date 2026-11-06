"use client";

import { useState } from 'react';
import { isValidPassword, PASSWORD_RULE } from '@/lib/validator/user';

export default function RegisterOrLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    // Валідація тільки для реєстрації
    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError("Паролі не співпадають");
        return false;
      }

      const nameRegex = /^[A-Za-z0-9]+$/;
      if (!nameRegex.test(formData.nickname) || formData.nickname.length > 20) {
        setError("Нікнейм має містити тільки A-Z, a-z, 0-9 (до 20 символів)");
        return false;
      }

      if (!isValidPassword(formData.password)) {
        setError(PASSWORD_RULE);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Невірний формат пошти");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isRegister) {
        // Запит реєстрації
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname: formData.nickname,
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Помилка реєстрації");
        }

        alert("Реєстрація успішна! Увійдіть");
        setIsRegister(false);
        setFormData({ nickname: '', email: '', password: '', confirmPassword: '' });

      } else {
        // Тут буде логіка входу (потрібно реалізувати окремий API)
        console.log('Логін:', formData);
        alert('Функція входу ще не реалізована');
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : "Помилка сервера");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen d-flex flex-column align-items-center justify-content-center bg-light p-3">
      <div className="container px-4 py-5 bg-white shadow rounded" style={{ maxWidth: '500px' }}>
        <h1 className="text-center mb-4 text-primary">
          {isRegister ? 'Реєстрація' : 'Вхід'}
        </h1>
        
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-100">
          {isRegister && (
            <div className="mb-3">
              <label htmlFor="nickname" className="form-label">
                Нікнейм
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                className="form-control"
                placeholder="Тільки латинські літери та цифри"
              />
            </div>
          )}
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Електронна пошта
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="form-control"
              placeholder="example@mail.com"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="form-control"
              placeholder={isRegister ? "8–64 символи, можна спецсимволи" : "Введіть пароль"}
            />
          </div>

          {isRegister && (
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Повторіть пароль
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="form-control"
                placeholder="Повторіть пароль"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? 'Завантаження...' : (isRegister ? 'Зареєструватись' : 'Увійти')}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="btn btn-link text-primary"
          >
            {isRegister
              ? 'Вже маєте акаунт? Увійти'
              : 'Немає акаунту? Зареєструватись'}
          </button>
        </div>
      </div>
    </div>
  );
}