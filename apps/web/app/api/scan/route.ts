import { NextResponse } from "next/server";
import { scanQueue } from "../../redis/queue";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
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

    console.log(`[INFO] Adding scan job for URL: ${url}`);
    const job = await scanQueue.add("accessibility-scan", {
      url,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      jobId: job.id,
      status: "queued",
      url,
    });
  } catch (error) {
    console.error("[ERROR] Failed to create scan job:", error);
    return NextResponse.json(
      { error: "Failed to create scan job" },
      { status: 500 }
    );
  }
}
