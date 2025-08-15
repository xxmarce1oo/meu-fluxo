// src/components/TimeLogList.tsx
import { TimeLogData } from "@/lib/project-service";

// Função para formatar a duração de segundos para um formato legível
const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}

interface TimeLogListProps {
    logs: TimeLogData[];
}

export default function TimeLogList({ logs }: TimeLogListProps) {
    if (logs.length === 0) {
        return (
            <div className="p-4 bg-card border rounded-lg text-center">
                <p className="text-muted-foreground">Nenhum registro de tempo para esta atividade ainda.</p>
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