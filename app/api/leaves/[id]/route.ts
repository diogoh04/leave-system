import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  console.log("ID:", id)

  if (!id) {
    return Response.json({ error: "ID missing" }, { status: 400 })
  }

  const { status } = await req.json()

  const leave = await prisma.leaveRequest.update({
    where: { id: Number((await params).id) },
    data: { status },
  })

  return Response.json(leave)
}

type TokenPayload = {
  userId: number
  role: string
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return Response.json({ error: "Não autenticado" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = verifyToken(token) as TokenPayload

    const leaveId = Number(context.params.id)

    if (isNaN(leaveId)) {
      return Response.json({ error: "ID inválido" }, { status: 400 })
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    })

    if (!leave) {
      return Response.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    // admin pode apagar qualquer pedido
    // user normal só pode apagar o próprio
    if (user.role !== "ADMIN" && leave.userId !== user.userId) {
      return Response.json({ error: "Sem permissão" }, { status: 403 })
    }

    await prisma.leaveRequest.delete({
      where: { id: leaveId },
    })

    return Response.json({ message: "Pedido apagado com sucesso" })
  } catch (error) {
    console.error("DELETE leave error:", error)
    return Response.json({ error: "Erro ao apagar pedido" }, { status: 500 })
  }
}