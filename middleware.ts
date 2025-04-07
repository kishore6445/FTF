import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  try {
    // Create the Supabase middleware client
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    // This keeps the user's session alive but doesn't redirect
    await supabase.auth.getSession()

    // Add a check to see if the user is authenticated before redirecting
    const session = await supabase.auth.getSession()
    const isAuthenticated = !!session?.data?.session

    // Get the pathname from the request URL
    const { pathname } = new URL(req.url)

    // Define public routes that don't require authentication
    const publicRoutes = ["/login", "/signup", "/reset-password", "/", "/auth/callback"]

    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (!isAuthenticated && !publicRoutes.includes(pathname) && !pathname.startsWith("/api/")) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is authenticated and trying to access login/signup, redirect to dashboard
    if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Always continue with the request
    return res
  } catch (error) {
    console.error("Middleware session refresh error:", error)
    // If there's an error, still allow the request to continue
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}

