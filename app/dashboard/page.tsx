"use client"

import { useEffect, useState } from "react"
import "react-datepicker/dist/react-datepicker.css"
import "react-calendar/dist/Calendar.css"
import dynamic from "next/dynamic"
import Image from "next/image"

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
      alert(data.error || "Error in search request")
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
  alert("Select the dates")
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

    alert("request created succefuly!")
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
      padding: "20px 16px",
    }}
  >
    {/* HEADER */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 24,
        maxWidth: 1200,
        margin: "0 auto 24px",
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>User Dashboard</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.08)",
            padding: "5px 10px",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            {user?.name?.charAt(0)}
          </div>
          {editing ? (
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ fontSize: 12, padding: "2px 4px", borderRadius: 4, border: "none" }}
            />
          ) : (
            <span style={{ fontSize: 12 }}>{user?.name}</span>
          )}
          <button
            onClick={editing ? handleUpdateName : () => setEditing(true)}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "white" }}
          >
            {editing ? "✔" : "✏️"}
          </button>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token")
            window.location.href = "/login"
          }}
          style={{
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "#3b82f6",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </div>

    {/* GRID PRINCIPAL: sidebar + calendario */}
    <div className="top-grid">
      <div className="sidebar-col">
        <Image
          src="/Bidvest-noonan.jpg"
          alt="Bidvest Noonan"
          width={150}
          height={10}
          priority
          style={{ borderRadius: 8 }}
        />

        <div className="card">
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>
            How to use this site
          </h3>
          <ol style={{ fontSize: 12, color: "#475569", paddingLeft: 16, lineHeight: 1.6, margin: 0 }}>
            <li>Select the dates on the calendar — start date and end date.</li>
            <li>Your request must be made at least 15 days in advance.</li>
            <li>Only 3 team leaders can be on holiday on the same day.</li>
            <li>Choose the type of holiday.</li>
            <li>Your request will remain pending until approved or declined by your supervisor.</li>
          </ol>
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, fontStyle: "italic" }}>
            If you have any questions, contact your supervisor.
          </p>
        </div>
      </div>

      <div className="card calendar-card">
        <p style={{ marginBottom: 12, fontSize: 14, color: "#94a3b8", textAlign: "center", fontWeight: 500 }}>
          Select the dates on the calendar.
        </p>
        <Calendar
          locale="en-GB"
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
              if (date >= startDate && date <= endDate) return "selected-range"
            }
            if (startDate && date.toDateString() === startDate.toDateString()) return "selected-start"
            if (endDate && date.toDateString() === endDate.toDateString()) return "selected-end"
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
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4, cursor: "pointer" }}
                title={users.map((u) => `${u.name} (${u.type})`).join("\n")}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: count >= 3 ? "#ef4444" : "#3b82f6" }} />
                <span style={{ fontSize: 10 }}>{count}</span>
              </div>
            )
          }}
        />
      </div>
    </div>

    {/* GRID INFERIOR: form + pedidos */}
    <div className="bottom-grid">
      <div className="card form-card">
        <h2 style={{ marginBottom: 15, color: "#1e293b", fontSize: 16 }}>New Request</h2>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 14, color: "#475569" }}>Start Date</label>
          <input type="date" readOnly value={formatInputDate(startDate)} onChange={(e) => setStartDate(new Date(e.target.value))} />
          {startDate && (
            <p style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #cbd5e1", marginTop: 5, background: "#f8fafc", color: "#0f172a", fontSize: 14 }}>
              {formatDate(startDate.toISOString())}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 14, color: "#475569" }}>End Date</label>
          <input type="date" readOnly value={formatInputDate(endDate)} onChange={(e) => setEndDate(new Date(e.target.value))} />
          {endDate && (
            <p style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #cbd5e1", marginTop: 5, background: "#f8fafc", color: "#0f172a", fontSize: 14 }}>
              {formatDate(endDate.toISOString())}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 14, color: "#475569" }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 5, background: "#f1f5f9", color: "#0f172a", fontSize: 14 }}
          >
            <option value="Paid">💰 Paid</option>
            <option value="Unpaid">🚫 Unpaid</option>
            <option value="AA">🏖️ AA</option>
          </select>
        </div>

        <button
          onClick={createLeave}
          style={{ width: "100%", padding: 12, background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
        >
          Create Request
        </button>
      </div>

      <div className="requests-col">
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>My Requests</h2>
        {leaves.map((leave: any) => (
          <div key={leave.id} style={{ marginBottom: 10, padding: 12, background: "rgba(255,255,255,0.06)", borderRadius: 10, position: "relative" }}>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this request?")) deleteLeave(leave.id)
              }}
              style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", color: "#ef4444", fontSize: 13, cursor: "pointer" }}
            >
              🗑️
            </button>
            <b style={{ fontSize: 13 }}>{leave.user?.name}</b>
            <div style={{ fontSize: 13, color: "#cbd5e1" }}>
              {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
            </div>
            <div style={{ fontSize: 13, color: "#cbd5e1" }}>Status: {leave.status}</div>
            <div style={{ fontSize: 13, color: "#cbd5e1" }}>Type: {leave.type}</div>
          </div>
        ))}
      </div>
    </div>

    <style jsx>{`
      .card {
        background: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .top-grid {
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 24px;
        max-width: 1200px;
        margin: 0 auto 24px;
        align-items: start;
      }
      .sidebar-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      .calendar-card {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .bottom-grid {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 24px;
        max-width: 1200px;
        margin: 0 auto;
        align-items: start;
      }
      @media (max-width: 800px) {
        .top-grid,
        .bottom-grid {
          grid-template-columns: 1fr;
        }
        .sidebar-col {
          align-items: stretch;
        }
      }
    `}</style>
  </div>
)}