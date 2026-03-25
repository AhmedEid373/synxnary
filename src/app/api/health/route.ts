import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    database: "unknown",
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "MISSING",
  };

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    checks.database = "connected";
  } catch (error) {
    checks.database = `error: ${error instanceof Error ? error.message : String(error)}`;
    checks.status = "unhealthy";
  }

  return NextResponse.json(checks, {
    status: checks.status === "ok" ? 200 : 500,
  });
}
