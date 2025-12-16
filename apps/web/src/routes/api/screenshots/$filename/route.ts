import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const Route = createFileRoute("/api/screenshots/$filename")({
  server: {
    GET: async ({ params }) => {
      const { filename: jobId } = params;

      if (!jobId) {
        return json({ error: "Job ID is required" }, { status: 400 });
      }

      // Validate jobId to prevent directory traversal
      if (jobId.includes("..") || jobId.includes("/") || jobId.includes("\\")) {
        return json({ error: "Invalid job ID" }, { status: 400 });
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
        return json({ error: "Screenshot not found" }, { status: 404 });
      }

      try {
        // Read the file
        const fileBuffer = await readFile(screenshotPath);
        const contentType = "image/png";

        return new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
            "Content-Length": fileBuffer.length.toString(),
          },
        });
      } catch (error) {
        console.error("[ERROR] Failed to serve screenshot:", error);
        return json({ error: "Failed to serve screenshot" }, { status: 500 });
      }
    },
  },
});
