import { checkUnauthorizedAccess } from "@/lib/get-session";
import { prisma, Route } from "@beacon/db";
import { logger } from "@beacon/logger";

export const getRegisteredRoutes = async () => {
  const user = await checkUnauthorizedAccess();

  try {
    const routes = await prisma.route.findMany({
      where: {
        userId: user?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return routes;
  } catch (error) {
    logger.error("Error occurred while trying to fetch routes", error);
    return [];
  }
};

export const getRoute = async () => {
  const user = await checkUnauthorizedAccess();

  try {
    const route = await prisma.route.findFirst({
      where: {
        userId: user?.id,
      },
    });
    return route;
  } catch (error) {
    logger.error("Error occurred while trying to fetch routes", error);
    return null;
  }
};
