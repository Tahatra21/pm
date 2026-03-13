import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/calendar", "/api/auth/login", "/api/auth/register"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Allow static files
    if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
        return NextResponse.next();
    }

    // Check session cookie safely
    let token = null;
    try {
        const cookie = request.cookies.get("session_token");
        token = cookie?.value;
    } catch (e) {
        console.error("Middleware error reading cookie:", e);
    }

    if (!token) {
        // API routes: return 401 JSON
        if (pathname.startsWith("/api/")) {
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { 'content-type': 'application/json' } }
            );
        }
        // Pages: redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
