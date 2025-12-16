import { checkUnauthorizedAccess } from "@/lib/get-session";
import { getCache, getRedisConnection } from "@beacon/redis";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/jobs/$statusId/status")({
  server: {
    GET: async ({ params }) => {
      getRedisConnection();
      await checkUnauthorizedAccess();
      const { statusId } = params;

      if (!statusId) {
        return json({ error: "Status ID is required" }, { status: 400 });
      }

      try {
        const status = (await getCache(statusId)) as {
          step: string;
          progress: number;
          message: string;
        };
        return json(status);
      } catch (error) {
        console.error("[ERROR] Failed to get job status:", error);
        return json({ error: "Failed to get job status" }, { status: 500 });
      }
    },
  },
});
