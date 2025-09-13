"use server";
import { ServerActionResponse } from "@/lib/error";
import { checkUnauthorizedAccess } from "@/lib/get-session";
import { RegisterRouteFormValues } from "@/lib/zod-schemas";
import { prisma } from "@beacon/db";
import { logger } from "@beacon/logger";
import { revalidatePath } from "next/cache";
export const registerRoute = async (
  formData: RegisterRouteFormValues
): Promise<ServerActionResponse<{ id: string; registerdUrl: string }>> => {
  const user = await checkUnauthorizedAccess();
  const { url, name, type } = formData;

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
      metadata: {
        name,
        type,
      },
    },
  });
  revalidatePath("/");
  return {
    id,
    registerdUrl,
  };
};
