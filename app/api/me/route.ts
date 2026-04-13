import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function PUT(req: Request) {
  const body = await req.json()

  const token = req.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return Response.json({ error: "No token" }, { status: 401 })
  }
  const decoded = verifyToken(token)

  if (!decoded) {
    return Response.json({ error: "Invalid token" }, { status: 401 })
  }
  const userId = decoded.userId

  const user = await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      name: body.name
    }
  })

  return Response.json(user)
}