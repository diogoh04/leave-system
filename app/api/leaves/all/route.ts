import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Token inválido" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    const user = verifyToken(token) as {
      userId: number
      email: string
      role: string
    } | null

    if (!user) {
      return Response.json({ error: "Token inválido" }, { status: 401 })
    }

    if (user.role !== "ADMIN") {
      return Response.json({ error: "Sem permissão" }, { status: 403 })
    }

    const leaves = await prisma.leaveRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    return Response.json(leaves)
  } catch (error) {
    return Response.json({ error: "Erro interno" }, { status: 500 })
  }
}