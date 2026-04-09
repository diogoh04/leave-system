"use client"

import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [type, setType] = useState("Paid")

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      window.location.href = "/login"
      return
    }

    fetchMyLeaves()
  }, [])

  async function fetchMyLeaves() {
    const token = localStorage.getItem("token")

    const res = await fetch("/api/leaves", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Erro ao buscar pedidos")
      return
    }

    setLeaves(data)
  }

  async function createLeave() {
    const token = localStorage.getItem("token")

    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate,
        endDate,
        type,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Erro ao criar pedido")
      return
    }

    alert("Pedido criado com sucesso")
    setStartDate("")
    setEndDate("")
    setType("Paid")
    fetchMyLeaves()
  }

  function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

  return (
    <div style={{ padding: 20 }}>
      <h1>User Dashboard</h1>

      <button
        onClick={() => {
          localStorage.removeItem("token")
          window.location.href = "/login"
        }}
        style={{ marginBottom: 20 }}
      >
        Logout
      </button>

      <h2>Novo pedido</h2>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <br /><br />

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <br /><br />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="Paid">Paid</option>
        <option value="Unpaid">Unpaid</option>
        <option value="AA">AA</option>
      </select>
      <br /><br />

      <button onClick={createLeave}>Criar pedido</button>

      <hr style={{ margin: "30px 0" }} />

      <h2>Meus pedidos</h2>

      {leaves.length === 0 ? (
        <p>Nenhum pedido encontrado</p>
      ) : (
        leaves.map((leave) => (
          <div
            key={leave.id}
            style={{
              border: "1px solid #333",
              borderRadius: 8,
              padding: 15,
              marginBottom: 15,
              background: "#111",
              color: "white",
            }}
          >
            <p><b>Início:</b> {formatDate(leave.startDate)}</p>
            <p><b>Fim:</b> {formatDate(leave.endDate)}</p>
            <p><b>Tipo:</b> {leave.type}</p>
            <p><b>Status:</b> {leave.status}</p>
          </div>
        ))
      )}
    </div>
  )
}