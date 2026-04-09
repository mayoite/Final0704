import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 auth/session hook. Keep it limited to Supabase-managed auth routes.

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/auth/callback"],
};
