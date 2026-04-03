import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { error } from "console"


export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER"
      },
    })

    const { password: _, ...userWithoutPassword } = user
    return Response.json(userWithoutPassword)


  } catch (error: any) {
    if (error.code === "P2002") {
      return Response.json(
        { error: "Email já existe" },
        { status: 400 }
      )
    }

    return Response.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {

  const userId = req.headers.get("x-user-id")
  if (!userId) {
  return Response.json([])
}

  const user = await prisma.user.findUnique({
    where:{ id: Number(userId) },
    select: {
      id: true,
      name: true,
      email: true
    }
  })

   if (!user) {
    return Response.json({ error: "User não encontrado" }, { status: 404 })
  }

  return Response.json(user)
}

export async function DELETE(req: Request) {
  const role = req.headers.get("x-user-role")

  if (role !== "ADMIN") {
    return Response.json(
      { error: "Acesso Negado" },
      { status: 403 }
    )
  }
  const { id } = await req.json()

  await prisma.user.delete({
    where: { id }
  })

  return Response.json({ message: "deleted" })
}

export async function PUT(req: Request) {
  const { id, name, email } = await req.json()

  const user = await prisma.user.update({
    where: { id },
    data: { name, email }
  })

  return Response.json(user)
}


