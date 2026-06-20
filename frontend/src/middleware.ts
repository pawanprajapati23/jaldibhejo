import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  
  // If the request comes from the old domain, redirect permanently (301) to the new domain
  if (host === "jaldibhejo.vercel.app" || host === "www.jaldibhejo.vercel.app") {
    const url = request.nextUrl.clone();
    url.host = "jaldibhejo.sizesnap.in";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - logo.png, favicon.ico, etc. (image / icon files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|apple-touch-icon.png|manifest.json).*)",
  ],
};
