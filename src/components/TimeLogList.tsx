// src/components/TimeLogList.tsx
import { TimeLogData } from "@/types";
import { formatDuration } from "@/lib/utils";
import { Clock } from "lucide-react"; // Adicionar ícone para estado vazio

interface TimeLogListProps {
    logs: TimeLogData[];
}

export default function TimeLogList({ logs }: TimeLogListProps) {
    if (logs.length === 0) {
        return (
            <div className="p-8 bg-card border rounded-lg">
                <div className="flex flex-col items-center justify-center text-center text-gray-500">
                    <Clock className="h-8 w-8 mb-3 text-gray-400" />
                    <h3 className="text-lg font-medium mb-1">Nenhum registro de tempo</h3>
                    <p className="text-sm">Use o timer acima para começar a registrar o tempo gasto neste projeto.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Registros de Tempo</h2>
            <ul className="space-y-3">
                {logs.map(log => (
                    <li key={log.id} className="p-3 bg-card border rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-medium">{log.description || "Sem descrição"}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(log.startTime).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div className="font-mono text-lg font-semibold">
                            {formatDuration(log.duration)}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}