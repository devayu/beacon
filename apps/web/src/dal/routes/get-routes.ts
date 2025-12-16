import { checkUnauthorizedAccess } from "@/lib/get-session";
import { prisma } from "@beacon/db";
import { logger } from "@beacon/logger";
import { createServerFn } from "@tanstack/react-start";

export const getRegisteredRoutes = createServerFn().handler(async () => {
  const user = await checkUnauthorizedAccess();

  console.log("user", user);
  try {
    const routes = await prisma.route.findMany({
      where: {
        userId: user?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(routes, "routes");
    return routes;
  } catch (error) {
    logger.error("Error occurred while trying to fetch routes", error);
    return [];
  }
});

export const getRouteById = createServerFn().handler(async (ctx: any) => {
  const { data: routeId } = ctx;
  const user = await checkUnauthorizedAccess();

  try {
    const route = await prisma.route.findFirst({
      where: {
        userId: user?.id,
        id: routeId,
      },
    });
    return route;
  } catch (error) {
    logger.error("Error occurred while trying to fetch routes", error);
    return null;
  }
});
