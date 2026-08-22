"use client"

import { useEffect, useMemo, useState } from "react"
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function AdminPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  const today = new Date()

  // filters
  const [filterName, setFilterName] = useState("")
  const [filterYear, setFilterYear] = useState(String(today.getFullYear()))
  const [filterMonthNum, setFilterMonthNum] = useState("") // "" (all) | "1".."12"
  const [filterWeek, setFilterWeek] = useState("") // week's Monday, "YYYY-MM-DD"
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchLeaves()
    setMounted(true)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) window.location.href = "/login"
  }, [])

  // day -> people on leave map, used to paint the calendar (same as the user dashboard)
  const fullDates = useMemo(() => {
    const map: Record<string, LeaveUser[]> = {}

    for (const leave of leaves) {
      if (leave.status !== "approved" && leave.status !== "pending") continue

      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      const current = new Date(start)

      while (current <= end) {
        const key = current.toISOString().split("T")[0]
        if (!map[key]) map[key] = []
        map[key].push({
          name: leave.user?.name || "User",
          type: leave.type,
          status: leave.status,
        })
        current.setDate(current.getDate() + 1)
      }
    }

    return map
  }, [leaves])

  // year/month used as the base to generate the "Week" selector options
  // (follows the selected month filter; if "All months", uses the current month)
  const weekBaseYear = Number(filterYear)
  const weekBaseMonth = filterMonthNum ? Number(filterMonthNum) : today.getMonth() + 1

  // list the weeks (Monday to Sunday) that touch the base month/year
  const weekOptions = useMemo(() => {
    const first = new Date(weekBaseYear, weekBaseMonth - 1, 1)
    const last = new Date(weekBaseYear, weekBaseMonth, 0)

    const start = new Date(first)
    const dow = start.getDay() // 0=Sun..6=Sat
    const diffToMonday = (dow + 6) % 7
    start.setDate(start.getDate() - diffToMonday)

    const weeks: { start: Date; end: Date }[] = []
    const cursor = new Date(start)

    while (cursor <= last) {
      const weekStart = new Date(cursor)
      const weekEnd = new Date(cursor)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weeks.push({ start: weekStart, end: weekEnd })
      cursor.setDate(cursor.getDate() + 7)
    }

    return weeks
  }, [weekBaseYear, weekBaseMonth])

  if (!mounted) return null

  async function fetchLeaves() {
    const token = localStorage.getItem("token")

    if (!token) {
      window.location.href = "/login"
      return
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))

      if (payload.role !== "ADMIN") {
        window.location.href = "/dashboard"
        return
      }
    } catch {
      window.location.href = "/login"
      return
    }

    const res = await fetch("/api/leaves/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Error fetching data")
      return
    }

    setLeaves(data)
  }

  async function updateStatus(id: string, status: string) {
    const token = localStorage.getItem("token")

    await fetch(`/api/leaves/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })

    fetchLeaves()
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  async function deleteLeave(id: number) {
    const token = localStorage.getItem("token")

    const res = await fetch(`/api/leaves/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Error deleting request")
      return
    }

    setLeaves((prev: any[]) => prev.filter((leave) => leave.id !== id))
  }

  function toDateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const filteredLeaves = leaves.filter((leave: any) => {
    if (filterName && !leave.user?.name?.toLowerCase().includes(filterName.toLowerCase())) {
      return false
    }

    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)

    if (selectedDate) {
      return selectedDate >= start && selectedDate <= end
    }

    if (filterWeek) {
      const weekStart = new Date(filterWeek)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      return start <= weekEnd && end >= weekStart
    }

    if (filterMonthNum) {
      const year = Number(filterYear)
      const month = Number(filterMonthNum)
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)
      return start <= monthEnd && end >= monthStart
    }

    return true
  })

  function clearFilters() {
    setFilterName("")
    setFilterYear(String(today.getFullYear()))
    setFilterMonthNum("")
    setFilterWeek("")
    setSelectedDate(null)
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
          <span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>⚙️ Admin Dashboard</span>
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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 40px" }}>
        {/* CALENDAR */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ ...card, padding: 20, marginBottom: 20, width: "fit-content", maxWidth: "100%" }}>
            <p style={{ marginBottom: 12, fontSize: 14, color: colors.muted, textAlign: "center", fontWeight: 500 }}>
              Click on a day to filter the requests for that day.
            </p>
            <Calendar
              locale="en-GB"
              onClickDay={(date) => {
                setSelectedDate((prev) => (prev && prev.toDateString() === date.toDateString() ? null : date))
                setFilterMonthNum("")
                setFilterWeek("")
              }}
              tileClassName={({ date }) => {
                const key = date.toISOString().split("T")[0]
                const users = fullDates[key] || []
                const count = users.length

                if (count >= 3) return "full-day"
                if (selectedDate && date.toDateString() === selectedDate.toDateString()) return "selected-start"
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
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}
                    title={users.map((u) => `${u.name} (${u.type})`).join("\n")}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: count >= 3 ? colors.danger : colors.blue }} />
                    <span style={{ fontSize: 10 }}>{count}</span>
                  </div>
                )
              }}
            />
          </div>
        </div>

        {/* FILTERS */}
        <div style={{ ...card, padding: 16, display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <div style={filterField}>
            <label style={filterLabel}>Name</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              style={input}
            />
          </div>

          <div style={filterField}>
            <label style={filterLabel}>Month</label>
            <select
              value={filterMonthNum}
              onChange={(e) => {
                setFilterMonthNum(e.target.value)
                setFilterWeek("")
                setSelectedDate(null)
              }}
              style={input}
            >
              <option value="">All months</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={String(i + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div style={filterField}>
            <label style={filterLabel}>Year</label>
            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value)
                setFilterWeek("")
                setSelectedDate(null)
              }}
              style={input}
            >
              {Array.from({ length: 4 }, (_, i) => today.getFullYear() - 1 + i).map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div style={filterField}>
            <label style={filterLabel}>Week</label>
            <select
              value={filterWeek}
              onChange={(e) => {
                setFilterWeek(e.target.value)
                setSelectedDate(null)
              }}
              style={input}
            >
              <option value="">All weeks</option>
              {weekOptions.map((w) => (
                <option key={toDateKey(w.start)} value={toDateKey(w.start)}>
                  {formatDate(w.start.toISOString())} – {formatDate(w.end.toISOString())}
                </option>
              ))}
            </select>
          </div>

          <button onClick={clearFilters} style={buttonStyle("secondary")}>
            Clear filters
          </button>
        </div>

        {selectedDate && (
          <p style={{ marginBottom: 12, fontSize: 13, color: colors.blue }}>
            Showing requests for {formatDate(selectedDate.toISOString())} —{" "}
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setSelectedDate(null)}>
              clear
            </span>
          </p>
        )}

        {/* TABLE */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={tableHeader}>
            <span>User</span>
            <span>Start</span>
            <span>End</span>
            <span>Type</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {leaves.length === 0 ? (
            <p style={{ padding: 20, color: colors.muted }}>No requests found</p>
          ) : filteredLeaves.length === 0 ? (
            <p style={{ padding: 20, color: colors.muted }}>No requests match the filters</p>
          ) : (
            filteredLeaves.map((leave) => (
              <div key={leave.id} style={row}>
                <span>{leave.user?.name}</span>
                <span>{formatDate(leave.startDate)}</span>
                <span>{formatDate(leave.endDate)}</span>
                <span>{leave.type}</span>

                <span>
                  <span style={badgeStyle(leave.status)}>{leave.status}</span>
                </span>

                <div>
                  <button
                    onClick={() => updateStatus(leave.id, "approved")}
                    style={approveBtn}
                  >
                    ✔
                  </button>

                  <button
                    onClick={() => updateStatus(leave.id, "rejected")}
                    style={rejectBtn}
                  >
                    ✖
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this request?")) {
                        deleteLeave(leave.id)
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: colors.danger,
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

//
// 🎨 STYLES
//

const filterField = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 4,
}

const filterLabel = {
  fontSize: 12,
  color: colors.muted,
}

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 120px",
  padding: 15,
  background: colors.bg,
  borderBottom: `1px solid ${colors.border}`,
  fontWeight: "bold",
  color: colors.text,
  fontSize: 13,
}

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 120px",
  padding: 15,
  borderTop: `1px solid ${colors.border}`,
  alignItems: "center",
  fontSize: 13,
  color: colors.text,
}

const approveBtn = {
  marginRight: 8,
  padding: "5px 10px",
  background: colors.success,
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
}

const rejectBtn = {
  padding: "5px 10px",
  background: colors.danger,
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
}
