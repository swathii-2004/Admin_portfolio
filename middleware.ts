import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get authentication cookie
  const isAuthenticated = request.cookies.get("admin_authenticated")?.value === "true";
  
  console.log("🔒 Middleware Check:", {
    path: pathname,
    authenticated: isAuthenticated,
    cookie: request.cookies.get("admin_authenticated")
  });
  
  // Allow access to login page
  if (pathname === "/login") {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      console.log("✅ Already authenticated, redirecting to dashboard");
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow access to login page
    return NextResponse.next();
  }
  
  // For all other pages, check authentication
  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  console.log("✅ Authenticated, allowing access");
  return NextResponse.next();
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they have their own auth if needed)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, pdfs, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|ico|js|css|woff|woff2|ttf)$).*)",
  ],
};