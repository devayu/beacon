import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
): Promise<NextResponse> {
  try {
    const { filename: jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Validate jobId to prevent directory traversal
    if (jobId.includes("..") || jobId.includes("/") || jobId.includes("\\")) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    // Construct path to screenshot in a11y-engine using jobId
    const screenshotPath = join(
      process.cwd(),
      "..",
      "a11y-engine",
      "accessibility-reports",
      "screenshots",
      `${jobId}_violations.png`
    );

    // Check if file exists
    if (!existsSync(screenshotPath)) {
      return NextResponse.json(
        { error: "Screenshot not found" },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await readFile(screenshotPath);

    // Since we're always serving PNG files for violations
    const contentType = "image/png";

    // Return the image with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[ERROR] Failed to serve screenshot:", error);
    return NextResponse.json(
      { error: "Failed to serve screenshot" },
      { status: 500 }
    );
  }
}
