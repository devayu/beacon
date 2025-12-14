import { checkUnauthorizedAccess } from "@/lib/get-session";
import { getCache, getRedisConnection } from "@beacon/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { statusId: string } }
) {
  getRedisConnection();
  await checkUnauthorizedAccess();
  try {
    const { statusId } = await params;

    if (!statusId) {
      return NextResponse.json(
        { error: "Status ID is required" },
        { status: 400 }
      );
    }

    // Get status from Redis cache
    const status = (await getCache(statusId)) as {
      step: string;
      progress: number;
      message: string;
    };
    return NextResponse.json(status);
  } catch (error) {
    console.error("[ERROR] Failed to get job status:", error);
    return NextResponse.json(
      { error: "Failed to get job status" },
      { status: 500 }
    );
  }
}
