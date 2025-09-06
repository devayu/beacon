import "server-only";
import { unauthorized } from "next/navigation";
import { auth } from "./auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import { cache } from "react";
export const getServerSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};

export const getServerUser = async () => {
  const session = await getServerSession();
  return session?.user;
};

export const checkUnauthorizedAccess = cache(async () => {
  const user = await getServerUser();
  if (!user) return unauthorized();
  return user;
});
