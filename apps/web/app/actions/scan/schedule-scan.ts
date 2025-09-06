"use server";
import { scanQueue } from "@/app/redis/queue";
import { ServerActionResponse } from "@/lib/error";
import { checkUnauthorizedAccess } from "@/lib/get-session";
import { prisma } from "@beacon/db";
import { logger } from "@beacon/logger";
import { delCache, setCache } from "@beacon/redis";
import { v4 as uuidv4 } from "uuid";

export const scheduleScan = async (
  id: string
): Promise<
  ServerActionResponse<{
    jobId: string;
    status: string;
    statusId: string;
    url: string;
  }>
> => {
  const user = await checkUnauthorizedAccess();

  const existingRoute = await prisma.route.findFirst({
    where: { id },
  });
  if (!existingRoute) {
    return { error: "Invalid route" };
  }
  const { url } = existingRoute;
  logger.info(`Adding scan job for URL: ${url}`);
  const jobStatusId = uuidv4();

  await setCache(jobStatusId, "CREATING", 7200);
  const { id: jobDbId } = await prisma.scanJob.create({
    data: {
      routeId: id,
      userId: user.id,
    },
  });

  try {
    const job = await scanQueue.add(jobStatusId, {
      url,
      timestamp: new Date().toISOString(),
      statusId: jobStatusId,
      jobDbId,
    });
    if (!job.id) {
      return { error: "Error occured while trying to schedule a job" };
    }
    await setCache(jobStatusId, "PENDING", 7200);
    return {
      jobId: job.id,
      status: "QUEUED",
      statusId: jobStatusId,
      url,
    };
  } catch (err) {
    await delCache(jobStatusId);
    return { error: "Error occured while trying to schedule a job" };
  }
};
