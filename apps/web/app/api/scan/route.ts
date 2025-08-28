import { NextResponse } from "next/server";
import { scanQueue } from "../../redis/queue";

export async function POST(request: Request): Promise<NextResponse> {
  console.log("adding job");
  const job = await scanQueue.add("new job", {
    url: "https://devayu.vercel.app/",
  });
  return NextResponse.json({
    jobId: job.id,
    data: job.returnvalue,
  });
}
