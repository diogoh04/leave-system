"use client"

import { useState } from "react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSignup() {
    const res = await fetch("/api/signup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name, email, password }),
})

const data = await res.json()

console.log("STATUS:", res.status)
console.log("DATA:", data)

if (!res.ok) {
  alert(data.error || "Erro ao criar conta")
  return
}

alert("Conta criada!")
   window.location.href = "/login"
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: 40,
          borderRadius: 12,
          width: 350,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ marginBottom: 20 }}>📝 Criar conta</h2>

        <input placeholder="Nome" style={input} />

        <input placeholder="Email" style={input} />

        <input type="password" placeholder="Password" style={input} />

        <button style={button} onClick={handleSignup}>Criar conta</button>

        <p style={{ marginTop: 15, fontSize: 14 }}>
          Já tem conta?{" "}
          <a href="/login" style={{ color: "#3b82f6" }}>
            Login
          </a>
        </p>
      </div>
    </div>
  )
}

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: 15,
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
}

const button = {
  width: "100%",
  padding: "10px",
  borderRadius: 6,
  border: "none",
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
}