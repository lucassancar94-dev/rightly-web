import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyToken } from "./auth";

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const jar = await cookies();
  return verifyToken(jar.get(ADMIN_COOKIE)?.value, "admin");
}
