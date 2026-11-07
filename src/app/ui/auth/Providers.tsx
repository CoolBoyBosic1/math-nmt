"use client";

import { SessionProvider } from "next-auth/react";

// Дає клієнтським компонентам доступ до сесії через useSession().
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
