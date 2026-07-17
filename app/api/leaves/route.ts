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
      alert("Select the dates")
      return Response.json({ error: "Fill in the required fields" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    // datas inválidas
    if (start > end) {
      return Response.json({ error: "The start date must be earlier than the end date" }, { status: 400 })
    }

    // passado
    if (start < now) {
      return Response.json({ error: "you cannot choose past dates" }, { status: 400 })
    }

    // antecedência mínima de 15 dias
    const diffDias = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDias < 15) {
      return Response.json(
        { error: "Minimum 15 days' notice required for holiday requests, Any questions talk with your manager." },
        { status: 400 }
      )
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
      return Response.json({ error: "there is already a request in this period" }, { status: 400 })
    }

    // 🔥 LIMITE DE 3 PESSOAS POR DIA

const overlappingLeaves = await prisma.leaveRequest.findMany({
  where: {
    status: { in: ["approved", "pending"] },
    AND: [
      { startDate: { lte: end } },
      { endDate: { gte: start } }
    ]
  }
})

// função para gerar dias
function getDatesBetween(start: Date, end: Date) {
  const dates = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

const requestedDates = getDatesBetween(start, end)

for (const date of requestedDates) {
  let count = 0

  for (const leave of overlappingLeaves) {
    if (date >= leave.startDate && date <= leave.endDate) {
      count++
    }
  }

  if (count >= 3) {
    return Response.json(
      { error: `Dia ${date.toLocaleDateString("pt-PT")} has already reached the Team Leader limit on the same day!` },
      { status: 400 }
    )
  }
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