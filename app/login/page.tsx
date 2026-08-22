"use client"

import { useState } from "react"
import Image from "next/image"
import { colors, input, buttonStyle } from "@/lib/theme"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      alert("Fill in email and password")
      return
    }

    setLoading(true)

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg,
        padding: 20,
      }}
    >
      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: "36px 32px",
          width: 360,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Image src="/Bidvest-noonanlogo.jpg" alt="Bidvest Noonan" width={160} height={72} priority style={{ height: "auto" }} />
        </div>

        <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.text, textAlign: "center", marginBottom: 4 }}>
          Holiday Management
        </h1>
        <p style={{ fontSize: 13, color: colors.muted, textAlign: "center", marginBottom: 24 }}>
          Sign in to manage your requests
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleLogin()
          }}
        >
          <label style={label}>Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...input, marginBottom: 14 }}
          />

          <label style={label}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...input, marginBottom: 20 }}
          />

          <button type="submit" disabled={loading} style={{ ...buttonStyle("primary"), width: "100%", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Entering..." : "Enter"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color: colors.muted, textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <a href="/signup" style={{ color: colors.blue, fontWeight: 600, textDecoration: "none" }}>
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}

const label = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: colors.muted,
  marginBottom: 6,
}
