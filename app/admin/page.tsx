"use client"

const th = {
  padding: 10,
  borderBottom: "1px solid #ccc",
  textAlign: "left" as const,
}

const td = {
  padding: 10,
  borderBottom: "1px solid #eee",
}

const approveBtn = {
  marginRight: 8,
  padding: "5px 10px",
  background: "green",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
}

const rejectBtn = {
  padding: "5px 10px",
  background: "red",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
}

import { useEffect, useState } from "react"

export default function AdminPage() {
  const [leaves, setLeaves] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetchLeaves()
  }, [])

  useEffect(() => {
  setMounted(true)
}, [])

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      window.location.href = "/login"
    }
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

  console.log("STATUS:", res.status)

  const data = await res.json()

  console.log("DATA:", data)

  if (!res.ok) {
    console.error("ERRO:", data)
    alert(data.error || "Erro ao buscar dados")
    return
  }

  setLeaves(data)
}
  

  // Aprovar / Rejeitar
  async function updateStatus(id: string, status: string) {
  const token = localStorage.getItem("token")

  await fetch(`/api/leaves/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  })

  fetchLeaves() 

  }

  function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-PT")
}

  // UI
  return (
  <div style={{ padding: 20, fontFamily: "Arial" }}>
    <h1 style={{ marginBottom: 20 }}>Admin Dashboard</h1>

    <button
      onClick={() => {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }}
      style={{
        marginBottom: 20,
        padding: "8px 16px",
        background: "#333",
        color: "white",
        border: "none",
        borderRadius: 5,
        cursor: "pointer",
      }}
    >
      Logout
    </button>

    {leaves.length === 0 ? (
      <p>No data</p>
    ) : (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={th}>User</th>
            <th style={th}>Start</th>
            <th style={th}>End</th>
            <th style={th}>Type</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((leave: any) => (
            <tr key={leave.id}>
              <td style={td}>{leave.user?.name}</td>
              <td style={td}>
                {new formatDate(leave.startDate).toLocaleDateString()}
              </td>
              <td style={td}>
                {new Date(leave.endDate).toLocaleDateString()}
              </td>
              <td style={td}>{leave.type}</td>
              <td style={td}>{leave.status}</td>

              <td style={td}>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}