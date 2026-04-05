import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// proxy.ts — Next.js 16 replacement for middleware.ts
// Runs in Node.js runtime (not Edge), so @supabase/ssr works correctly.

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|@vite/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
