// Paleta e estilos compartilhados entre as páginas (login, signup, dashboard, admin).
// Baseado na identidade visual Bidvest Noonan: navy escuro + azul de destaque, sobre fundo claro.

export const colors = {
  navy: "#101a3d",
  navyLight: "#1c2b5c",
  blue: "#2ea8e0",
  blueSoft: "#e7f4fb",
  bg: "#f3f5f8",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  success: "#16a34a",
  successSoft: "#eafaf0",
  danger: "#dc2626",
  dangerSoft: "#fdecec",
  warning: "#d97706",
  warningSoft: "#fdf3e2",
}

export const page = {
  minHeight: "100vh",
  background: colors.bg,
  color: colors.text,
  fontFamily: "var(--font-geist-sans, Arial, sans-serif)",
}

export const navbar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 28px",
  background: colors.card,
  borderBottom: `1px solid ${colors.border}`,
  flexWrap: "wrap" as const,
  gap: 12,
}

export const card = {
  background: colors.card,
  borderRadius: 16,
  border: `1px solid ${colors.border}`,
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
}

export const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  background: "#fff",
  color: colors.text,
  fontSize: 14,
  boxSizing: "border-box" as const,
}

export function buttonStyle(variant: "primary" | "secondary" | "danger" = "primary") {
  const base = {
    padding: "10px 18px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    border: "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  }

  if (variant === "primary") {
    return { ...base, background: colors.navy, color: "#fff" }
  }
  if (variant === "danger") {
    return { ...base, background: colors.danger, color: "#fff" }
  }
  // secondary: outline, matches "Search"/"Users"/"Logout" style
  return { ...base, background: "#fff", color: colors.navy, border: `1px solid ${colors.border}` }
}

export function badgeStyle(status: string) {
  const base = {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize" as const,
  }

  if (status === "approved") {
    return { ...base, background: colors.successSoft, color: colors.success }
  }
  if (status === "rejected") {
    return { ...base, background: colors.dangerSoft, color: colors.danger }
  }
  return { ...base, background: colors.warningSoft, color: colors.warning }
}
