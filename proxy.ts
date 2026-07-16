import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

const publicRoutes = ["/login"];

async function isAuthenticated(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const token = req.cookies.get("session")?.value;
  const authed = await isAuthenticated(token);

  if (!isPublicRoute && !authed) {
    const url = new URL("/login", req.nextUrl);
    if (path !== "/") url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  if (isPublicRoute && authed) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
