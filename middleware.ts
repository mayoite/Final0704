import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Keep middleware as the auth/session entrypoint so Cloudflare/OpenNext
// can emit the expected server middleware bundle during adaptation.
export async function middleware(request: NextRequest) {
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
