import Image from "next/image";

export default function Home() {
  return (
  <div style={{ padding: 20 }}>
  <h1>Sistema de Férias 🚀</h1>
  <p>Primeira versão funcionando</p>

  <div style={{ marginTop: 20 }}>
    <a href="/login">
      <button style={{ marginRight: 10 }}>Login</button>
    </a>

    <a href="/signup">
      <button>Criar conta</button>
    </a>
  </div>
</div>
  )
}