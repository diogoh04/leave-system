"use client"

import { useEffect, useState } from "react"
import  DatePicker  from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "react-calendar/dist/Calendar.css"
import dynamic from "next/dynamic"

const Calendar = dynamic(() => import("react-calendar"), {
  ssr: false,
})

export default function DashboardPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(null)
  const [endDate, setEndDate] = useState<any>(null)
  const [type, setType] = useState("Paid")
  const [fullDates, setFullDates] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      window.location.href = "/login"
      return
    }
    setMounted(true)
    fetchFullDates()
    fetchMyLeaves()
  }, [])

  if (!mounted) return null

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

 async function fetchFullDates() {
  const token = localStorage.getItem("token")

  const res = await fetch("/api/leaves/full-dates", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()

  setFullDates(data)
}

  async function createLeave() {
    const token = localStorage.getItem("token")

    if (!startDate || !endDate) {                
  alert("Seleciona as datas")
  return
}
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
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

const inputDateStyle = {
  width: "100%",
  padding: "10px",
  marginTop: 5,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#1e293b",
  color: "white",
}

return (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
      color: "white",
      padding: 30,
    }}
  >
    {/* HEADER */}
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <h1>User Dashboard</h1>

      <button
        onClick={() => {
          localStorage.removeItem("token")
          window.location.href = "/login"
        }}
      >
        Logout
      </button>
    </div>

    {/* CONTEÚDO */}
<div style={{
  maxWidth: 1200,
  margin: "0 auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: 50,
  marginTop: 40
}}>

  {/* 🗓️ CALENDÁRIO */}
  <div>
    <Calendar
      locale="pt-PT"
      tileClassName={({ date }) => {
        const key = date.toISOString().split("T")[0]
        const users = fullDates[key] || []
        const count = users.length

        if (count >= 3) return "full-day"
        if (count >= 1) return "busy-day"
        return ""
      }}
      tileContent={({ date }) => {
        const key = date.toISOString().split("T")[0]
        const users = fullDates[key] || []
        const count = users.length

        if (count === 0) return null

        return (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: count >= 3 ? "red" : "orange",
                marginRight: 4,
              }}
            />
            <span style={{ fontSize: 10 }}>{count}</span>
          </div>
        )
      }}
    />
  </div>

  {/* 📦 FORM */}
  <div style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    width: 300,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  }}>
    <h2 style={{ marginBottom: 15, color: "#1e293b" }}>
      Novo pedido
    </h2>

    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 14, color: "#475569" }}>
        Data início
      </label>
      <input
        type="date"
        value={startDate ? startDate.toISOString().split("T")[0] : ""}
        onChange={(e) => setStartDate(new Date(e.target.value))}
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          marginTop: 5
        }}
      />
    </div>

    <div style={{ marginBottom: 15 }}>
      <label style={{ fontSize: 14, color: "#475569" }}>
        Data fim
      </label>
      <input
        type="date"
        value={endDate ? endDate.toISOString().split("T")[0] : ""}
        onChange={(e) => setEndDate(new Date(e.target.value))}
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          marginTop: 5
        }}
      />
    </div>

    <button
      onClick={createLeave}
      style={{
        width: "100%",
        padding: 10,
        background: "#22c55e",
        color: "white",
        border: "none",
        borderRadius: 8,
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      Criar pedido
    </button>
  </div>

  {/* 📋 PEDIDOS */}
  <div style={{ width: 350 }}>
    <h2>Pedidos</h2>

    {leaves.map((leave: any) => (
      <div
        key={leave.id}
        style={{
          marginBottom: 10,
          padding: 10,
          background: "#1e293b",
          borderRadius: 8,
        }}
      >
        <b>{leave.user?.name}</b>
        <div>
          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
        </div>
        <div>Status: {leave.status}</div>
      </div>
    ))}
  </div>

</div>
  </div>
)
}