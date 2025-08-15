// src/app/page.tsx
import LoginButton from "@/components/LoginButton"; // <-- IMPORTAR

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Meu Fluxo</h1>
      <LoginButton /> {/* <-- USAR O BOTÃO */}
    </main>
  );
}