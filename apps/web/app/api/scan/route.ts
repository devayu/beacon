import { NextResponse } from "next/server";
import { scanQueue } from "../../redis/queue";
import { v4 as uuidv4 } from "uuid";
import { setCache, delCache } from "@beacon/redis";
import { logger } from "@beacon/logger";
import { prisma } from "../../../lib/db";
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    logger.info(`Adding scan job for URL: ${url}`);
    const jobStatusId = uuidv4();

    await setCache(jobStatusId, "CREATING");
    const { id: jobDbId } = await prisma.scanJob.create({
      data: {
        url,
      },
    });

    try {
      const job = await scanQueue.add(jobStatusId, {
        url,
        timestamp: new Date().toISOString(),
        statusId: jobStatusId,
        jobDbId,
      });
      await setCache(jobStatusId, "PENDING");
      return NextResponse.json({
        jobId: job.id,
        status: "QUEUED",
        statusId: jobStatusId,
        url,
      });
    } catch (err) {
      await delCache(jobStatusId);
      throw err;
    }
  } catch (error) {
    console.error("[ERROR] Failed to create scan job:", error);
    return NextResponse.json(
      { error: "Failed to create scan job" },
      { status: 500 }
    );
  }
}
