import { checkUnauthorizedAccess } from "@/lib/get-session";
import { prisma } from "@beacon/db";
import { createServerFn } from "@tanstack/react-start";
// import { logger } from "@beacon/logger";

export const getLastRuns = createServerFn().handler(async (ctx: any) => {
  const { data: routeId } = ctx;
  const user = await checkUnauthorizedAccess();

  try {
    const route = await prisma.route.findFirst({
      where: {
        userId: user?.id,
        id: routeId,
      },
    });
    if (!route) {
      return { error: "Route not found" };
    }

    const lastScans = await prisma.scanJob.findMany({
      where: {
        routeId,
        userId: user.id,
        status: "COMPLETED",
      },
      select: {
        transformedResult: true,
        screenshotUrl: true,
        id: true,
        violationsScreenshotUrl: true,
        updatedAt: true,
        status: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return {
      metadata: route,
      lastScans,
    };
  } catch (error) {
    console.error("Error occurred while trying to fetch routes", error);
    return { lastScans: [] };
  }
});

export type GetLastRunsT = Awaited<ReturnType<typeof getLastRuns>>;
