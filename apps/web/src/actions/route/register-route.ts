import { generateCron } from "@/lib/cron";
import { ServerActionResponse } from "@/lib/error";
import { checkUnauthorizedAccess } from "@/lib/get-session";
import { RegisterRouteFormValues } from "@/lib/zod-schemas";
import { prisma } from "@beacon/db";
import { createServerFn } from "@tanstack/react-start";

export const registerRoute = createServerFn().handler(
  async (
    ctx: any
  ): Promise<ServerActionResponse<{ id: string; registerdUrl: string }>> => {
    const formData = ctx.data as RegisterRouteFormValues;
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
    // Generate default cron expression for weekly Sunday at 9 AM
    const defaultCron = generateCron("weekly", "09:00", "0");

    console.info(`Registering route: ${url}`);
    const { id, url: registerdUrl } = await prisma.route.create({
      data: {
        url: url,
        userId: user.id,
        metadata: {
          name,
          type,
          frequency: defaultCron,
        },
      },
    });
    // refr("/");
    return {
      id,
      registerdUrl,
    };
  }
);
