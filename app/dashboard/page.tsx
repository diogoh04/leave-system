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
  const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768)
  }

  handleResize()
  window.addEventListener("resize", handleResize)

  return () => window.removeEventListener("resize", handleResize)
}, [])

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

function formatInputDate(date: Date | null) {
  if (!date) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
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

    {/* CONTAINER PRINCIPAL */}
<div style={{
  maxWidth: 1200,
  margin: "0 auto",
  padding: 20
}}>
  <div style={{
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1fr 350px",
  gap: 40,
  marginTop: 40,
  alignItems: "start"
}}>

  {/* CALENDARIO*/}
 <div style={{
  width: "100%",
  justifyContent:"center",
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "rgba(255,255,255,0.05)",
  padding: 15,
  borderRadius: 12
}}>

  <p style={{
    marginBottom: 12,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: 500
  }}>
    Selecione o período de férias no calendário
  </p>
    <Calendar
      locale="pt-PT"

      onClickDay={(date) => {
  if (!startDate || (startDate && endDate)) {
    setStartDate(date)
    setEndDate(null)
  } else {
    if (date < startDate) {
      setEndDate(startDate)
      setStartDate(date)
    } else {
      setEndDate(date)
    }
  }
}}

      tileClassName={({ date }) => {
  const key = date.toISOString().split("T")[0]
  const users = fullDates[key] || []
  const count = users.length

  if (count >= 3) return "full-day"

  if (startDate && endDate) {
    if (date >= startDate && date <= endDate) {
      return "selected-range"
    }
  }
  if (startDate && date.toDateString() === startDate.toDateString()) {
    return "selected-start"
  }
  if (endDate && date.toDateString() === endDate.toDateString()) {
    return "selected-end"
  }
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
  <div style={{
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1fr 350px",
  gap: 40,
  marginTop: 40,
  alignItems: "start"
}}>

  {/* 📦 FORM */}
  <div style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    width: 300,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    position: "relative",
    zIndex: 10
  }}>
    <h2 style={{ marginBottom: 15, color: "#1e293b" }}>
      New Request
    </h2>

    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 14, color: "#475569" }}>
        Data início
      </label>
      <input
        type="date"
        readOnly
        value={formatInputDate(startDate)}
        onChange={(e) => setStartDate(new Date(e.target.value))}
        />
        {startDate && (
       <p style={{
          width: isMobile ? "100%" : 300,
          padding: 8,
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          marginTop: 5,
          background:"#f8fafc",
          color:"#0f172a",
          fontSize: 14,
          outline:"none"
        }}>
          {formatDate(startDate.toISOString())}
        </p>
        )}
    </div>

    <div style={{ marginBottom: 15 }}>
      <label style={{ fontSize: 14, color: "#475569" }}>
        Data fim
      </label>
      <input
        type="date"
        readOnly
        value={formatInputDate(endDate)}
        onChange={(e) => setEndDate(new Date(e.target.value))}
        />
        {endDate && (
       <p style={{
          width: "100%",
          padding: 8,
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          marginTop: 5,
          background:"#f8fafc",
          color:"#0f172a",
          fontSize: 14,
          outline:"none"
        }}>
        {formatDate(endDate.toISOString())}
      </p>
        )}
    </div>

    <div style={{ marginBottom: 15 }}>
  <label style={{ fontSize: 14, color: "#475569" }}>
    Tipo
  </label>

  <select
    value={type}
    onChange={(e) => setType(e.target.value)}
    style={{
      width: "100%",
      padding: 10,
      borderRadius: 8,
      border: "1px solid #cbd5e1",
      marginTop: 5,
      background: "#f1f5f9",
      color: "#0f172a",
      fontSize: 14
    }}
  >
    <option value="Paid">💰 Paid</option>
    <option value="Unpaid">🚫 Unpaid</option>
    <option value="AA">🏖️ AA</option>
  </select>
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
      Create Request
    </button>
  </div>

  {/* 📋 PEDIDOS */}
  <div style={{ width: isMobile ? "100%" : 350 }}>
    <h2>My Requests</h2>

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
        <div>tipo: {leave.type}</div>
      </div>
    ))}
  </div>
  </div>
  </div>

  </div>
  </div>
)
}