import { NextResponse } from "next/server";
import { APP_CONFIG } from "@strava-musician-app/shared";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: APP_CONFIG.appName,
    version: APP_CONFIG.version,
    timestamp: new Date().toISOString(),
  });
}
