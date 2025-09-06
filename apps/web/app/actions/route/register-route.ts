"use server";
import { ServerActionResponse } from "@/lib/error";
import { checkUnauthorizedAccess } from "@/lib/get-session";
import { prisma } from "@beacon/db";
import { logger } from "@beacon/logger";
import { revalidatePath } from "next/cache";

export const registerRoute = async (
  _: any,
  formData: FormData
): Promise<ServerActionResponse<{ id: string; registerdUrl: string }>> => {
  const user = await checkUnauthorizedAccess();
  const url = formData.get("url") as string;
  try {
    new URL(url);
  } catch {
    return { error: "Invalid url" };
  }
  const existingRoute = await prisma.route.findFirst({
    where: {
      url,
      userId: user.id,
    },
  });
  if (existingRoute) {
    return {
      error:
        "Route already exists, cannot register the route with the same url",
    };
  }
  logger.info(`Registering route: ${url}`);
  const { id, url: registerdUrl } = await prisma.route.create({
    data: {
      url: url,
      userId: user.id,
    },
  });
  revalidatePath("/");
  return {
    id,
    registerdUrl,
  };
};
