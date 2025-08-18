// src/components/ui/Sonner.tsx
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

// Adicionamos a propriedade 'group' ao tipo
type ToasterProps = React.ComponentProps<typeof Sonner> & {
  group?: string;
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      // Passamos todas as props, incluindo a 'group'
      {...props}
    />
  )
}

export { Toaster }