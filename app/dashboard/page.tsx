"use client"

import { useEffect, useState } from "react"
import  DatePicker  from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

export default function DashboardPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(null)
  const [endDate, setEndDate] = useState<any>(null)
  const [type, setType] = useState("Paid")
  const [fullDates, setFullDates] = useState<Record<string, number>>({})

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      window.location.href = "/login"
      return
    }
    fetchFullDates()
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

 async function fetchFullDates() {
  const res = await fetch("/api/leaves/full-dates")
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

    {/* CALENDÁRIO GRANDE (TOPO) */}
    <div style={{ marginTop: 20 }}>
      <Calendar
  locale="pt-PT"
  tileClassName={({ date }) => {
    const key = date.toISOString().split("T")[0]

    if (fullDates[key] >= 3) return "full-day"
    if (fullDates[key] >= 1) return "busy-day"
    return ""
  }}
/>
</div>

       
    

    {/* CONTEÚDO */}
    <div style={{ display: "flex", gap: 30, marginTop: 30 }}>
      
      {/* FORM */}
      <div style={{ flex: 1 }}>
        <h2>Novo pedido</h2>

        <div style={{ marginBottom: 10 }}>
          <label>Data início</label>
          <DatePicker
            selected={startDate}
            onChange={(date: any) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Data fim</label>
          <DatePicker
            selected={endDate}
            onChange={(date: any) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <button onClick={createLeave}>Criar pedido</button>
      </div>

      {/* LISTA */}
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