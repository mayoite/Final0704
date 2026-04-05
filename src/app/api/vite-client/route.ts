import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse("export {};\n", {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
