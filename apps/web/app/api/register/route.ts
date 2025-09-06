import { checkUnauthorizedAccess } from "@/lib/get-session";
import { logger } from "@beacon/logger";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function POST(request: Request): Promise<NextResponse> {
  const user = await checkUnauthorizedAccess();

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const existingRoute = await prisma.route.findFirst({
      where: {
        url,
      },
    });
    if (existingRoute) {
      return NextResponse.json(
        {
          error:
            "Route already exists, cannot register the route with same url",
        },
        { status: 409 }
      );
    }
    logger.info(`Registering route: ${url}`);
    const registeredRoute = await prisma.route.create({
      data: {
        url: url,
        userId: user.id,
      },
    });
    return NextResponse.json({
      id: registeredRoute.id,
      url: registeredRoute.url,
    });
  } catch (error) {
    logger.error("Failed to register the route:", error);
    return NextResponse.json(
      { error: "Failed to register the route" },
      { status: 500 }
    );
  }
}
