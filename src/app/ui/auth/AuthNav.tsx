"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

// Посилання в шапці: «Реєстрація/Увійти» для гостя, нікнейм і «Вийти» після входу.
export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <Link className="text-primary me-3" href="/register">
        Реєстрація/Увійти
      </Link>
    );
  }

  return (
    <>
      <span className="me-3 text-secondary">{session.user.name}</span>
      <button className="btn btn-link text-primary p-0 me-3 align-baseline" onClick={() => signOut({ callbackUrl: "/" })}>
        Вийти
      </button>
    </>
  );
}
