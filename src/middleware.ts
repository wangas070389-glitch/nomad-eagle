import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Middleware is used to restrict access to routes
// and also to enforce the "Gatekeeper" logic for Pending users.

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        if (path === "/api/diagnostic") {
            return NextResponse.next()
        }

        // 0. Operation Genesis: The Backdoor
        // Fail-safe: Always allow the Root User, regardless of DB status.
        if (token?.email === "admin@nomad.com") {
            // We continue to allow standard routing, but we SKIP the "Gatekeeper Logic" block below.
            // Actually, if we just return, we might bypass the "Admin Shield" check too?
            // No, Admin Shield is separate. 
            // We just want to avoid the "Force to /pending" check.
            // Let's structure it so we bypass the PENDING check.
        }

        // 1. Gatekeeper Logic: All users must be ACTIVE to access dashboard
        // If user is logged in (token exists) but status is NOT active, force them to /pending
        // UNLESS they are already on /pending or signing out.
        // BYPASS: If email is admin@nomad.com, ignore this check.
        if (token && token.email !== "admin@nomad.com" && token.status !== "ACTIVE" && path !== "/pending") {
            // Allow them to visit the pending page.
            // If they are REJECTED, maybe send them elsewhere? Pending page handles both for now.
            return NextResponse.redirect(new URL("/pending", req.url))
        }

        // 1.5 If user IS ACTIVE but tries to go to /pending, send them to /
        if (token && token.status === "ACTIVE" && path === "/pending") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        // 2. Admin Shield: Only ADMIN can access /admin routes
        if (path.startsWith("/admin")) {
            if (token?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/", req.url))
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/sign-in',
        }
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth endpoints)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|api/diagnostic|_next/static|_next/image|favicon.ico).*)"
    ]
}
