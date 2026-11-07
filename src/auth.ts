import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authorizeCredentials } from "@/lib/auth-credentials";

// Вхід за email і паролем. Сесія зберігається в підписаному JWT у cookie,
// тож окрема таблиця сесій у БД не потрібна. Ключ підпису — змінна AUTH_SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: (credentials) => authorizeCredentials(credentials?.email, credentials?.password),
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/register" },
  callbacks: {
    // token.sub = id користувача; прокидаємо його в session.user.id для сторінок і API.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

/** ID користувача з поточної сесії або null, якщо не виконано вхід. */
export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
