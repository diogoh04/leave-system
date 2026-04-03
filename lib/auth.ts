import  jwt from "jsonwebtoken";

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "segredo_super_secreto"

        ) as {
            userId: number
            email: string
            role?: string
        }
    } catch {
        return null
    }
}