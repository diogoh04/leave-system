"use client"

import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import "react-calendar/dist/Calendar.css"
import dynamic from "next/dynamic"

const Calendar = dynamic(() => import("react-calendar"), {
  ssr: false,
})
   type LeaveUser = {
  name: string
  type: string
  status: string
}

export default function DashboardPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(null)
  const [endDate, setEndDate] = useState<any>(null)
  const [type, setType] = useState("Paid")
  const [fullDates, setFullDates] = useState<Record<string, LeaveUser[]>>({})
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState("")

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
  
const fetchUser = async () => {
  const token = localStorage.getItem("token")

  const res = await fetch("/api/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const error = await res.json()
    console.log(error)
    return
  }

  const data = await res.json()
  setUser(data)
  setNewName(data.name)
}

  useEffect(() => {
  fetchUser()
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
function formatInputDate(date: Date | null) {
  if (!date) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
async function deleteLeave(id: number) {
  const token = localStorage.getItem("token")

  await fetch(`/api/leaves/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  setLeaves((prev: any[]) => prev.filter(l => l.id !== id))
}
const handleUpdateName = async () => {
  const token = localStorage.getItem("token")

  const res = await fetch("/api/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name: newName })
  })

  if (!res.ok) {
    const errorData = await res.json()
    console.log(errorData)
    return
  }

  const data = await res.json()
  setUser(data)
  setEditing(false)
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
<div
  style={{
    maxWidth: 1200,
    margin: "0 auto",
    padding: 20,
  }}
>
  <div
    style={{
      display: "flex",
      flexWrap: "wrap", 
      justifyContent: "center",
      gap: 30,
      marginTop: 40,
    }}
  >
  {/* CALENDARIO*/}
 <div style={{
  flex: "1 1 400px",
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
  const users: LeaveUser[] = fullDates[key] || []
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
          <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 4,
    cursor: "pointer"
  }}
  title={users.map(u => `${u.name} (${u.type})`).join("\n")}
>
  <div
    style={{
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: count >= 3 ? "red" : "orange"
    }}
  />

  {/* quantidade de pessoas */}
  <span style={{ fontSize: 10 }}>
    {count}
  </span>
</div>
          )
      }}
    />
  </div>
 <div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: 40,
  marginTop: 40,
  justifyContent: "center",
  alignItems: "flex-start"
}}>
  <div style={{
  background: "white",
  padding: 20,
  borderRadius: 12,
  width: 300,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
}}>
  <h3 style={{ marginBottom: 10 }}>My Profile</h3>

  <p><strong>Name:</strong> {user?.name}</p>
  <p><strong>Email:</strong> {user?.email}</p>

  <button
    onClick={() => setEditing(true)}
    style={{
      marginTop: 10,
      background: "#f59e0b",
      color: "white",
      border: "none",
      padding: "6px 12px",
      borderRadius: 6,
      cursor: "pointer"
    }}
  >
    Edit Name
  </button>
  {editing && (
  <div style={{ marginTop: 10 }}>
    <input
      value={newName}
      onChange={(e) => setNewName(e.target.value)}
      style={{
        padding: 6,
        borderRadius: 6,
        border: "1px solid #ccc",
        width: "100%"
      }}
    />

    <button onClick={handleUpdateName} style={{ marginTop: 8 }}>
      Save
    </button>
  </div>
)}
</div>

  {/* 📦 FORM */}
  <div style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    flex: "1 1 320px",
    maxWidth: 350,
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
    Type
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
  <div style={{ width: isMobile ? "100%" : 350, 
    flex:"1 1 300%"
  }}>
    <h2>My Requests</h2>

    {leaves.map((leave: any) => (
      <div
        key={leave.id}
        style={{
          marginBottom: 10,
          padding: 10,
          background: "#1e293b",
          borderRadius: 8,
          position: "relative",
        }}
      >
        <button
        onClick={() => {
  if (confirm("Deseja deletar este pedido?")) {
    deleteLeave(leave.id)
  }
}}
  style={{
    position: "absolute",
    top: 8,
    right: 8,
    background: "transparent",
    border: "none",
    color: "#ef4444",
    fontSize: 16,
    cursor: "pointer"
  }}
>
  🗑️ Delete
</button>
        <b>{leave.user?.name}</b>
        <div>
          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
        </div>
        <div>Status: {leave.status}</div>
        <div>type: {leave.type}</div>
      </div>
    ))}
  </div>
  </div>
  </div>

  </div>
  </div>
)
}