import { NextResponse } from "next/server";

function redirectTo(targetPath: string, requestUrl: string) {
  const url = new URL(requestUrl);
  url.pathname = targetPath;
  url.search = "";
  url.hash = "";
  return NextResponse.redirect(url, 307);
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();

  if (pathname.startsWith("/images/catalog/oando-seating--toro/image-")) {
    return redirectTo("/images/products/seating/toro-1.webp", request.url);
  }

  if (pathname.startsWith("/images/catalog/oando-seating--wing/image-")) {
    return redirectTo("/images/hero/hero-1.webp", request.url);
  }

  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
