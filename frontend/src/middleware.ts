import { jwtVerify } from "jose";
import { NextResponse, NextRequest } from "next/server";

const JWT_SECRET_STRING = process.env.JWT_SECRET;

let JWT_SECRET_KEY: Uint8Array;

if (JWT_SECRET_STRING) {
  JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
} else {
  console.log("Critial Error: JWT_SECRET environment variable not defined!");
}

export async function middleware(request: NextRequest) {
  // If JWT secret isn't configured, skip auth checks to avoid redirect loops in dev
  if (!JWT_SECRET_STRING) {
    return NextResponse.next();
  }
  const token = request.cookies.get("auth_token")?.value;

  const protectedRoutes = ["/dashboard", "/about", "/export", "/draft"];

  if (
    protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    if (!token) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
      console.error("No Token");
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET_KEY);
    } catch (error) {
      console.error("Invalid Token", error);
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  console.log("redirecting to page...");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/about/:path*",
    "/export/:path*",
    "/draft/:path*",
  ],
};
