import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export default function proxy(req: NextRequest) {
  
const pathname = req.nextUrl.pathname
  if (pathname.startsWith("/api/login") ||
      pathname.startsWith("/api/signup")) {
  return NextResponse.next()
}

const authHeader =
    req.headers.get("authorization") ||
    req.headers.get("Authorization")

  if (!authHeader) {
    return NextResponse.json(
      { error: "Sem token" },
      { status: 401 }
    )
  }
  

  const token = authHeader?.split(" ")[1]
  const decoded = verifyToken(token) as {
    userId: number
    email: string
    role: string
  } | null

  if (!decoded?.userId) {
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    )
  }
  const requestHeaders = new Headers(req.headers)

  requestHeaders.set("x-user-id", String(decoded.userId))
  requestHeaders.set("x-user-role", decoded.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
export const config = {
  matcher: ["/api/:path*"],
}