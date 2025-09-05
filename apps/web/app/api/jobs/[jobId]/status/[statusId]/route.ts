import { NextResponse } from "next/server";
import { redis, scanQueue } from "../../../../../redis/queue";

export async function GET(
  request: Request,
  { params }: { params: { jobId: string; statusId: string } }
): Promise<NextResponse> {
  try {
    const { jobId, statusId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    const status = await redis.get(statusId);
    console.log("status", status);

    const job = await scanQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const jobState = await job.getState();
    const progress = job.progress;

    let response: any = {
      jobId,
      status: jobState,
      progress,
      createdAt: job.timestamp,
      processedOn: job.processedOn,
    };

    // Check for AI-processed results in Redis
    const scanResult = await redis.get(`scan-result:${jobId}`);
    if (scanResult) {
      const parsedResult = JSON.parse(scanResult);
      response = {
        ...response,
        result: parsedResult,
      };
    } else if (jobState === "completed" && job.returnvalue) {
      // Fallback to job return value if no AI result yet
      response = {
        ...response,
        result: job.returnvalue,
      };
    }

    // Include error information if job failed
    if (jobState === "failed" && job.failedReason) {
      response = {
        ...response,
        error: job.failedReason,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ERROR] Failed to get job status:", error);
    return NextResponse.json(
      { error: "Failed to get job status" },
      { status: 500 }
    );
  }
}
