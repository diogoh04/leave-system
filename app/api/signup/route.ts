import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    })

    return Response.json(user)
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