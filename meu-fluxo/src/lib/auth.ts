// src/lib/auth.ts
import GitHubProvider from "next-auth/providers/github"
import { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  // Configure um ou mais provedores de autenticação
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    // ...adicionar mais provedores aqui
  ],
  secret: process.env.AUTH_SECRET,
}
