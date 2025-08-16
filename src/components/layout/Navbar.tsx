// src/components/layout/Navbar.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="bg-background border-b fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="font-bold text-lg">Meu Fluxo</div>
        <div className="flex items-center gap-4"> {/* Wrapper para alinhar os itens */}
          <ThemeToggle />
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={session.user.image || ''} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}