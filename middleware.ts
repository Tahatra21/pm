import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/calendar"];

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

    // Check session cookie
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
        // API routes: return 401 JSON
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Pages: redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
