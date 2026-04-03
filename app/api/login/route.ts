import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return Response.json(
      { error: "Email e password obrigatórios" },
      { status: 400 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return Response.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return Response.json(
        { error: "Senha inválida" },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    )

    return Response.json({
      message: "Login realizado com sucesso",
      token,
    })
  } catch (error) {
    return Response.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}