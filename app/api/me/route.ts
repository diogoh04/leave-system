import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

function getTokenFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  return authHeader.split(" ")[1]
}

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)

  if (!token) {
    return Response.json({ error: "Token não enviado" }, { status: 401 })
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    return Response.json({ error: "Token inválido" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  })

  if (!user) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  return Response.json(user)
}

export async function PUT(req: Request) {
  const token = getTokenFromRequest(req)

  if (!token) {
    return Response.json({ error: "Token não enviado" }, { status: 401 })
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    return Response.json({ error: "Token inválido" }, { status: 401 })
  }

  const body = await req.json()

  const user = await prisma.user.update({
    where: { id: decoded.userId },
    data: {
      name: body.name
    }
  })

  return Response.json(user)
}