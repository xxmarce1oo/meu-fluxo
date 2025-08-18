// src/components/habits/WaterNotificationManager.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Bell, BellOff, BellRing } from "lucide-react";

const INTERVALS = [30, 45, 60, 90]; // Intervalos em minutos

export default function WaterNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [activeInterval, setActiveInterval] = useState<number | null>(null);

  // Ao carregar, verifica o status da permissão e o intervalo salvo
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      const savedInterval = localStorage.getItem('waterNotificationInterval');
      if (savedInterval) {
        startNotifications(parseInt(savedInterval, 10));
      }
    }
  }, []);
  
  // Função para pedir permissão ao usuário
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Este navegador não suporta notificações.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      toast.success("Permissão concedida! Agora você pode ativar os lembretes.");
    } else {
      toast.warning("Permissão negada. Não poderemos enviar lembretes.");
    }
  };
  
  // Limpa qualquer timer existente
  const clearExistingTimer = () => {
      const existingTimerId = localStorage.getItem('waterNotificationTimerId');
      if (existingTimerId) {
          clearInterval(parseInt(existingTimerId, 10));
          localStorage.removeItem('waterNotificationTimerId');
      }
  };

  // Função para iniciar as notificações
  const startNotifications = (minutes: number) => {
    if (permission !== "granted") {
      toast.info("Por favor, habilite as notificações primeiro.");
      requestPermission();
      return;
    }

    clearExistingTimer(); // Garante que não haja timers duplicados

    const timerId = setInterval(() => {
      new Notification("Hora de se hidratar! 💧", {
        body: "Beba um copo de água para manter sua meta.",
        icon: "/favicon.ico", // Opcional: use um ícone
      });
    }, minutes * 60 * 1000);

    localStorage.setItem('waterNotificationInterval', String(minutes));
    localStorage.setItem('waterNotificationTimerId', String(timerId));
    setActiveInterval(minutes);
    toast.success(`Lembretes ativados a cada ${minutes} minutos.`);
  };

  // Função para parar as notificações
  const stopNotifications = () => {
    clearExistingTimer();
    localStorage.removeItem('waterNotificationInterval');
    setActiveInterval(null);
    toast.info("Lembretes de água desativados.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing /> Lembretes de Hidratação
        </CardTitle>
        <CardDescription>
          Receba uma notificação para lembrar de beber água. O seu navegador pedirá permissão.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission !== 'granted' ? (
            <Button onClick={requestPermission}>
                <Bell className="mr-2 h-4 w-4"/>
                Habilitar Notificações
            </Button>
        ) : (
            <div className="flex flex-wrap gap-3">
                {INTERVALS.map(interval => (
                    <Button 
                        key={interval}
                        variant={activeInterval === interval ? 'default' : 'outline'}
                        onClick={() => startNotifications(interval)}
                    >
                        A cada {interval} min
                    </Button>
                ))}
                {activeInterval && (
                    <Button onClick={stopNotifications} variant="destructive">
                        <BellOff className="mr-2 h-4 w-4"/>
                        Parar
                    </Button>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}