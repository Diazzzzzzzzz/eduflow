import { NextResponse } from "next/server";

// Lightweight liveness probe for Railway's healthcheck. Always 200, no DB —
// unlike '/', which 307-redirects to /teacher and can trip strict healthchecks.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
