import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FocusTimerProps {
  sessionTitle: string;
  elapsedSeconds: number;
  isRunning: boolean;
  plannedMinutes?: number | null;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onComplete: () => void;
  onToggleFullscreen?: () => void;
}

export const formatFocusDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export const FocusTimer = ({
  sessionTitle,
  elapsedSeconds,
  isRunning,
  plannedMinutes,
  onStart,
  onPause,
  onReset,
  onComplete,
  onToggleFullscreen,
}: FocusTimerProps) => {
  const progressPercent = plannedMinutes
    ? Math.min((elapsedSeconds / (plannedMinutes * 60)) * 100, 100)
    : null;

  return (
    <Card className="p-4 border-2 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold">Sessione Focus: {sessionTitle}</h4>
          {plannedMinutes ? (
            <p className="text-xs text-muted-foreground font-mono">
              Obiettivo: {plannedMinutes} minuti
            </p>
          ) : (
            <p className="text-xs text-muted-foreground font-mono">Timer libero</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {progressPercent !== null && (
            <Badge className="text-xs border-2 border-soldi/30 bg-soldi/10 text-soldi">
              {progressPercent.toFixed(0)}% completato
            </Badge>
          )}
          {onToggleFullscreen ? (
            <Button variant="ghost" size="sm" className="border-2" onClick={onToggleFullscreen}>
              Schermo intero
            </Button>
          ) : null}
        </div>
      </div>

      <div className="text-4xl font-mono text-center tracking-widest">
        {formatFocusDuration(elapsedSeconds)}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={onStart} className="border-2" disabled={isRunning}>
          {elapsedSeconds === 0 ? "Avvia" : "Riprendi"}
        </Button>
        <Button variant="outline" className="border-2" onClick={onPause} disabled={!isRunning}>
          Pausa
        </Button>
        <Button variant="outline" className="border-2" onClick={onReset}>
          Reset
        </Button>
        <Button variant="destructive" className="border-2" onClick={onComplete} disabled={elapsedSeconds === 0}>
          Completa
        </Button>
      </div>

      {plannedMinutes ? (
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div
            className={cn("h-full bg-soldi transition-all", progressPercent === 100 && "bg-green-500")}
            style={{ width: `${progressPercent ?? 0}%` }}
          ></div>
        </div>
      ) : null}
    </Card>
  );
};
