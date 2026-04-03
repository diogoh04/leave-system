"use client"

import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

async function handleLogin() {
  console.log("🔥 CLICOU LOGIN")

  const res = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()
  const token = data.token
  
  if (!res.ok) {
    alert(data.error || "erro no login")
    return
  }
  if (!data.token) {
    alert("token invalido")
    return
  }

  localStorage.setItem("token", token)

  window.location.href = "/admin"
}

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
