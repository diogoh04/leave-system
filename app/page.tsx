import Image from "next/image";

export default function Home() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a", // dark moderno
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: 40,
          borderRadius: 12,
          background: "#1e293b",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          width: 350,
        }}
      >
        <h1 style={{ marginBottom: 10 }}>🚀 Leaves Request</h1>

        <p style={{ color: "#94a3b8", marginBottom: 30 }}>
          Bidvest Noonan Vaction Management
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <a href="/login" style={{ flex: 1 }}>
            <button
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 6,
                border: "none",
                background: "#22c55e",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Login
            </button>
          </a>

          <a href="/signup" style={{ flex: 1 }}>
            <button
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 6,
                border: "none",
                background: "#3b82f6",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Signup
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}