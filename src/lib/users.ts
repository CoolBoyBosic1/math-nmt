import bcrypt from "bcryptjs";

/** Поля користувача, які можна віддавати назовні (без пароля). */
export const publicUserSelect = {
  id: true,
  firstName: true,
  nickname: true,
  email: true,
} as const;

const BCRYPT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Прибирає пароль з об'єкта користувача перед відповіддю API. */
export function withoutPassword<T extends { password?: unknown }>(user: T): Omit<T, "password"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}
