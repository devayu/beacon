import { NextResponse } from "next/server";
import { scanQueue } from "../../../../redis/queue";

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

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

    // Include result data if job is completed
    if (jobState === "completed" && job.returnvalue) {
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
