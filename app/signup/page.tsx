"use client"

import { useState } from "react"
import Image from "next/image"
import { colors, input, buttonStyle } from "@/lib/theme"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    if (!name || !email || !password) {
      alert("Fill in all fields")
      return
    }

    setLoading(true)

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error || "Error in create account")
      return
    }

    alert("Account created successfully!")
    window.location.href = "/login"
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
          Create Account
        </h1>
        <p style={{ fontSize: 13, color: colors.muted, textAlign: "center", marginBottom: 24 }}>
          Sign up to request holidays and leave
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSignup()
          }}
        >
          <label style={label}>Name</label>
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ ...input, marginBottom: 14 }}
          />

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
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color: colors.muted, textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: colors.blue, fontWeight: 600, textDecoration: "none" }}>
            Login
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
