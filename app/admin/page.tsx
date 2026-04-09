"use client"

import { useEffect, useState } from "react"

export default function AdminPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [filterStart, setFilterStart] = useState("")
  const [filterEnd, setFilterEnd] = useState("")

  useEffect(() => {
    fetchLeaves()
    setMounted(true)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) window.location.href = "/login"
  }, [])

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
      alert(data.error || "Erro ao buscar dados")
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
    return new Date(date).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

const filteredLeaves = leaves.filter((leave: any) => {
  if (!filterStart && !filterEnd) return true

  const start = new Date(leave.startDate)
  const filterS = filterStart ? new Date(filterStart) : null
  const filterE = filterEnd ? new Date(filterEnd) : null

  if (filterS && start < filterS) return false
  if (filterE && start > filterE) return false

  return true
})

  const inputStyle = {
  padding: "8px",
  marginRight: 10,
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
}

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <h1>⚙️ Admin Dashboard</h1>

        <button
          onClick={() => {
            localStorage.removeItem("token")
            window.location.href = "/login"
          }}
          style={logoutBtn}
        >
          Logout
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
  <input
    type="date"
    value={filterStart}
    onChange={(e) => setFilterStart(e.target.value)}
    style={inputStyle}
  />

  <input
    type="date"
    value={filterEnd}
    onChange={(e) => setFilterEnd(e.target.value)}
    style={inputStyle}
  />
</div>
<button onClick={() => {
  setFilterStart("")
  setFilterEnd("")
}}>
  Limpar
</button>

      {/* TABLE */}
      <div style={tableContainer}>
        <div style={tableHeader}>
          <span>User</span>
          <span>Start</span>
          <span>End</span>
          <span>Type</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {leaves.length === 0 ? (
          <p style={{ padding: 20 }}>Nenhum pedido encontrado</p>
        ) : (
          filteredLeaves.map((leave) => (
            <div key={leave.id} style={row}>
              <span>{leave.user?.name}</span>
              <span>{formatDate(leave.startDate)}</span>
              <span>{formatDate(leave.endDate)}</span>
              <span>{leave.type}</span>

              <span style={getStatusStyle(leave.status)}>
                {leave.status}
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

//
// 🎨 ESTILOS
//

const container = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: 30,
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
}

const logoutBtn = {
  padding: "8px 16px",
  background: "#334155",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
}

const tableContainer = {
  border: "1px solid #334155",
  borderRadius: 10,
  overflow: "hidden",
}

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 120px",
  padding: 15,
  background: "#1e293b",
  fontWeight: "bold",
}

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 120px",
  padding: 15,
  borderTop: "1px solid #334155",
  alignItems: "center",
}

const approveBtn = {
  marginRight: 8,
  padding: "5px 10px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
}

const rejectBtn = {
  padding: "5px 10px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
}

function getStatusStyle(status: string) {
  if (status === "approved") {
    return { color: "#22c55e", fontWeight: "bold" }
  }
  if (status === "rejected") {
    return { color: "#ef4444", fontWeight: "bold" }
  }
  return { color: "#eab308", fontWeight: "bold" }
}