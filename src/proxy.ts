import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRODUCTION_HOST = "weedoloveweed.vercel.app";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // If the request is coming from a deployment-specific Vercel URL (not the
  // production alias), redirect to the alias so that auth cookies are always
  // set on the same domain as the OAuth callback.
  if (host !== PRODUCTION_HOST && host.endsWith(".vercel.app")) {
    const url = request.nextUrl.clone();
    url.host = PRODUCTION_HOST;
    url.port = "";
    return NextResponse.redirect(url, 302);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
