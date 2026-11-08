import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/users";
import { isValidEmail } from "@/lib/validator/user";

export type SessionUser = { id: string; email: string; name: string };

/**
 * Перевіряє email і пароль для входу. Повертає користувача або null.
 * Причину відмови (немає такого email чи хибний пароль) навмисно не розрізняємо,
 * щоб за відповіддю не можна було з'ясувати, які email зареєстровані.
 */
export async function authorizeCredentials(email: unknown, password: unknown): Promise<SessionUser | null> {
  if (typeof email !== "string" || typeof password !== "string") return null;
  if (!isValidEmail(email) || password.length === 0) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, nickname: true, password: true },
  });
  if (!user) return null;

  const ok = await verifyPassword(password, user.password);
  return ok ? { id: user.id, email: user.email, name: user.nickname } : null;
}
