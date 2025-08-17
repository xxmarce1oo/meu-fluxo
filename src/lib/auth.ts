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
  pages: {
    signIn: "/", // Página de login customizada (opcional)
    error: "/", // Página de erro customizada (opcional)
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Permitir todos os logins válidos
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirecionar para dashboard após login bem-sucedido
      if (url.startsWith("/")) {
        return url;
      }
      // Se vier de uma URL externa, sempre redirecionar para dashboard
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }) {
      // Customizar a sessão se necessário
      return session;
    },
    async jwt({ token, user }) {
      // Customizar o JWT se necessário
      return token;
    },
  },
}
