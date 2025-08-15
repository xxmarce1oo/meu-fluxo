// src/components/LoginButton.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>Olá, {session.user?.name}</p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
        >
          Sair
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
    >
      Entrar com GitHub
    </button>
  );
}