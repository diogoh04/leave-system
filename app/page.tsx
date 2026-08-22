import Image from "next/image"
import { colors, buttonStyle } from "@/lib/theme"

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg,
        padding: 20,
      }}
    >
      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: "36px 32px",
          width: 360,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Image src="/Bidvest-noonanlogo.jpg" alt="Bidvest Noonan" width={160} height={72} priority style={{ height: "auto" }} />
        </div>

        <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.text, textAlign: "center", marginBottom: 4 }}>
          Leaves Request
        </h1>
        <p style={{ fontSize: 13, color: colors.muted, textAlign: "center", marginBottom: 28 }}>
          Holiday Management
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="/login" style={{ textDecoration: "none" }}>
            <button style={{ ...buttonStyle("primary"), width: "100%" }}>Login</button>
          </a>

          <a href="/signup" style={{ textDecoration: "none" }}>
            <button style={{ ...buttonStyle("secondary"), width: "100%" }}>Create Account</button>
          </a>
        </div>
      </div>
    </div>
  )
}
