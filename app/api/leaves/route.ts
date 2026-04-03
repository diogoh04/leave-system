import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return Response.json({ error: "Não autenticado" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = verifyToken(token) as { userId: number }

    const { startDate, endDate, type } = await req.json()

    // campos obrigatórios
    if (!startDate || !endDate || !type) {
      return Response.json({ error: "Campos obrigatórios" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    // datas inválidas
    if (start >= end) {
      return Response.json({ error: "Data inicial deve ser menor que final" }, { status: 400 })
    }

    // passado
    if (start < now) {
      return Response.json({ error: "Não pode marcar no passado" }, { status: 400 })
    }

    // overlap
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId: user.userId,
        AND: [
          {
            startDate: { lte: end }
          },
          {
            endDate: { gte: start }
          }
        ]
      }
    })

    if (overlapping) {
      return Response.json({ error: "Já existe um pedido neste período" }, { status: 400 })
    }

    // criar pedido
    const leave = await prisma.leaveRequest.create({
      data: {
        userId: user.userId,
        startDate: start,
        endDate: end,
        type
      }
    })

    return Response.json(leave)

  } catch (err) {
    console.error(err)
    return Response.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id")
  const role = req.headers.get("x-user-role")

  if (!userId) {
    return Response.json({ error: "Não autenticado" }, { status: 401 })
  }

  let leaves

  if (role === "ADMIN") {
    // ADMIN vê todos
    leaves = await prisma.leaveRequest.findMany({
      include: { user: true }
    })
  } else {
    
    leaves = await prisma.leaveRequest.findMany({
      where: { userId: Number(userId) }
    })
  }

  return Response.json(leaves)
}

export async function PUT(req: Request) {
  const role = req.headers.get("x-user-role")

  if (role !== "ADMIN") {
    return Response.json({ error: "Acesso negado" }, { status: 403 })
  }

  const { id, status } = await req.json()

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status }
  })

  return Response.json(updated)
}