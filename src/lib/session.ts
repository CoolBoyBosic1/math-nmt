import { currentUserId } from "@/auth";
import { ApiError } from "@/lib/api-error";

/** ID користувача з сесії; без входу — 401. */
export async function requireUserId(): Promise<string> {
  const userID = await currentUserId();
  if (!userID) throw new ApiError(401, "Login required");
  return userID;
}

/** Дозволяє доступ лише до власних даних: інакше 401 (не ввійшов) або 403 (чужий userID). */
export async function requireSelf(userID: string): Promise<string> {
  const sessionUserID = await requireUserId();
  if (sessionUserID !== userID) throw new ApiError(403, "Access denied");
  return sessionUserID;
}
