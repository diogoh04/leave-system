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
    <div style={{ padding: 20 }}>
      <h1>Signup</h1>

      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <br /><br />

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <br /><br />

      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <br /><br />

      <button onClick={handleSignup}>Criar conta</button>
    </div>
  )
}