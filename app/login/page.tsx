"use client"

import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Erro no login")
      return
    }

    localStorage.setItem("token", data.token)

    if (data.role === "ADMIN") {
      window.location.href = "/admin"
    } else {
      window.location.href = "/dashboard"
    }
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
        <h2 style={{ marginBottom: 20 }}>🔐 Login</h2>

        <input
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={input}
/>

<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  style={input}
/>

        <button style={button} onClick={handleLogin}>Entrar</button>

        <p style={{ marginTop: 15, fontSize: 14 }}>
          Não tem conta?{" "}
          <a href="/signup" style={{ color: "#3b82f6" }}>
            Criar conta
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
  background: "#22c55e",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
}