"use client"

import { useEffect, useState } from "react"
import "react-calendar/dist/Calendar.css"
import dynamic from "next/dynamic"
import Image from "next/image"
import { colors, card, input, buttonStyle, badgeStyle } from "@/lib/theme"

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
  <div style={{ minHeight: "100vh", background: colors.bg }}>
    {/* NAVBAR */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        padding: "14px 28px",
        background: colors.card,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Image
          src="/Bidvest-noonanlogo.jpg"
          alt="Bidvest Noonan"
          width={120}
          height={54}
          priority
          style={{ height: "auto" }}
        />
        <span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>Staff Portal</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: colors.blueSoft,
            padding: "6px 12px",
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: colors.navy,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0)}
          </div>
          {editing ? (
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ fontSize: 12, padding: "3px 6px", borderRadius: 4, border: `1px solid ${colors.border}` }}
            />
          ) : (
            <span style={{ fontSize: 13, color: colors.text, fontWeight: 500 }}>{user?.name}</span>
          )}
          <button
            onClick={editing ? handleUpdateName : () => setEditing(true)}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 13, color: colors.navy }}
          >
            {editing ? "✔" : "✏️"}
          </button>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token")
            window.location.href = "/login"
          }}
          style={buttonStyle("secondary")}
        >
          Logout
        </button>
      </div>
    </div>

    {/* COLUNA ÚNICA: sempre vertical, no mobile e no desktop */}
    <div className="main-col" style={{ padding: "24px 16px 40px" }}>
      <div style={{ ...card, padding: 20, width: "100%" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: colors.text }}>
          How to use this site
        </h3>
        <ol style={{ fontSize: 12, color: colors.muted, paddingLeft: 16, lineHeight: 1.6, margin: 0 }}>
          <li>1. Select the dates on the calendar — start date and end date.</li>
          <li>2. Your request must be made at least 15 days in advance.</li>
          <li>3. Up to 3 team leaders can be on holiday on the same day .</li>
          <li>4. Colors for dates on the calendar: white is available; yellow has a team leader on this day, but is still available; red is unavailable.</li>
          <li>5. Your request will remain pending until approved or declined by your supervisor.</li>
        </ol>
        <p style={{ fontSize: 11, color: colors.muted, marginTop: 10, fontStyle: "italic" }}>
          If you have any questions, contact your supervisor.
        </p>
      </div>

      <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", width: "fit-content", maxWidth: "100%" }}>
        <p style={{ marginBottom: 12, fontSize: 14, color: colors.muted, textAlign: "center", fontWeight: 500 }}>
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
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: count >= 3 ? colors.danger : colors.blue }} />
                <span style={{ fontSize: 10 }}>{count}</span>
              </div>
            )
          }}
        />
      </div>

      <div style={{ ...card, padding: 20, width: "100%" }}>
        <h2 style={{ marginBottom: 15, color: colors.text, fontSize: 16 }}>New Request</h2>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 14, color: colors.muted }}>Start Date</label>
          <input type="date" readOnly value={formatInputDate(startDate)} onChange={(e) => setStartDate(new Date(e.target.value))} style={{ ...input, marginTop: 5 }} />
          {startDate && (
            <p style={{ width: "100%", padding: 8, borderRadius: 6, border: `1px solid ${colors.border}`, marginTop: 5, background: colors.bg, color: colors.text, fontSize: 14, boxSizing: "border-box" }}>
              {formatDate(startDate.toISOString())}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 14, color: colors.muted }}>End Date</label>
          <input type="date" readOnly value={formatInputDate(endDate)} onChange={(e) => setEndDate(new Date(e.target.value))} style={{ ...input, marginTop: 5 }} />
          {endDate && (
            <p style={{ width: "100%", padding: 8, borderRadius: 6, border: `1px solid ${colors.border}`, marginTop: 5, background: colors.bg, color: colors.text, fontSize: 14, boxSizing: "border-box" }}>
              {formatDate(endDate.toISOString())}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 14, color: colors.muted }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ ...input, marginTop: 5 }}
          >
            <option value="Paid">💰 Paid</option>
            <option value="Unpaid">🚫 Unpaid</option>
            <option value="AA">🏖️ AA</option>
          </select>
        </div>

        <button
          onClick={createLeave}
          style={{ ...buttonStyle("primary"), width: "100%" }}
        >
          Create Request
        </button>
      </div>

      <div style={{ ...card, padding: 20, width: "100%" }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: colors.text }}>My Requests</h2>

        {leaves.length === 0 && (
          <p style={{ fontSize: 13, color: colors.muted }}>You have no requests yet.</p>
        )}

        {leaves.map((leave: any) => (
          <div key={leave.id} style={{ marginBottom: 10, padding: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, position: "relative" }}>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this request?")) deleteLeave(leave.id)
              }}
              style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", color: colors.danger, fontSize: 13, cursor: "pointer" }}
            >
              Delete 🗑️
            </button>
            <b style={{ fontSize: 13, color: colors.text }}>{leave.user?.name}</b>
            <div style={{ fontSize: 13, color: colors.muted }}>
              {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
            </div>
            <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
              <span style={badgeStyle(leave.status)}>{leave.status}</span>
            </div>
            <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>Type: {leave.type}</div>
          </div>
        ))}
      </div>
    </div>

    <style jsx>{`
      .main-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        max-width: 420px;
        margin: 0 auto;
      }
    `}</style>
  </div>
)
}
