"use client"

import { useEffect, useState } from "react"
import  DatePicker  from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function DashboardPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [startDate, setStartDate] = useState<any>(null)
  const [endDate, setEndDate] = useState<any>(null)
  const [type, setType] = useState("Paid")
  const [fullDates, setFullDates] = useState<any[]>([])

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

  const parsed = data.map((d: string) => new Date(d))
  setFullDates(parsed)
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
  <div style={inputDateStyle}>
    <label>Data início</label>
  <DatePicker
    selected={startDate}
    onChange={(date: any) => setStartDate(date)}
    dateFormat="dd/MM/yyyy"
    placeholderText="Selecionar data"
    excludeDates={fullDates}
    dayClassName={(date) =>
      fullDates.some(d => d.toDateString() === date.toDateString())
        ? "full-day"
        : ""
    }
  />
</div>

<div style={inputDateStyle}>
  <label>Data Fim</label>
  <DatePicker
    selected={endDate}
    onChange={(date: any) => setEndDate(date)}
    dateFormat="dd/MM/yyyy"
    placeholderText="Selecionar data"
    excludeDates={fullDates}
    dayClassName={(date) =>
      fullDates.some(d => d.toDateString() === date.toDateString())
        ? "full-day"
        : ""
    }
  />
</div>
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