import Image from "next/image";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Sistema de Férias 🚀</h1>
      <p>Primeira versão funcionando</p>

      <br />

      <a href="/login">
        <button>Login</button>
      </a>

      <a href="/signup">
        <button>Criar conta</button>
      </a>
    </div>
  )
}