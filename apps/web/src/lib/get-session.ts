import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "./auth";

export const getServerSession = createServerFn().handler(
  async ({ context }) => {
    const session = await auth.api.getSession({
      headers: context.headers,
    });
    return session;
  }
);

export const getServerUser = async () => {
  const session = await getServerSession();
  return session?.user;
};

export const checkUnauthorizedAccess = async () => {
  const user = await getServerUser();
  if (!user) {
    throw redirect({ to: "/" });
  }
  return user;
};
