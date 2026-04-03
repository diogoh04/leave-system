import { prisma } from "@/lib/prisma"

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
    where: { id: Number(id) },
    data: { status },
  })

  return Response.json(leave)
}