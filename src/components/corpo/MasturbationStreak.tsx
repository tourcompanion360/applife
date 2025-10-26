import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, RotateCcw } from "lucide-react";

interface MasturbationStreakProps {
  onStreakChange?: (streak: number) => void;
}

interface StoredState {
  streak: number;
  lastUpdate: string;
  lastReset: string;
}

const STORAGE_KEY = "maya-masturbation-streak";

const toDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`);

const diffInDays = (from: string, to: string) => {
  const fromDate = toDate(from);
  const toDateValue = toDate(to);
  const diff = Math.floor((toDateValue.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
};

const getToday = () => new Date().toISOString().split("T")[0];

export const MasturbationStreak = ({ onStreakChange }: MasturbationStreakProps) => {
  const today = useMemo(getToday, []);
  const [state, setState] = useState<StoredState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as StoredState;
      }
    } catch (error) {
      console.error("Errore nel leggere lo streak", error);
    }
    return {
      streak: 0,
      lastUpdate: today,
      lastReset: today,
    };
  });

  useEffect(() => {
    const current = { ...state };
    const todayDate = getToday();

    if (current.lastUpdate !== todayDate) {
      const dayDiff = diffInDays(current.lastUpdate, todayDate);
      current.streak += dayDiff;
      current.lastUpdate = todayDate;
      setState(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      onStreakChange?.(current.streak);
      return;
    }

    onStreakChange?.(current.streak);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleReset = () => {
    const todayDate = getToday();
    const updated: StoredState = {
      streak: 0,
      lastUpdate: todayDate,
      lastReset: todayDate,
    };
    setState(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    onStreakChange?.(0);
  };

  useEffect(() => {
    onStreakChange?.(state.streak);
  }, [state.streak, onStreakChange]);

  return (
    <Card className="border-2 p-6 bg-corpo-light/20">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm border-2 bg-corpo-light">
            <Flame className="h-5 w-5 text-corpo" />
          </div>
          <div>
            <h3 className="text-lg font-bold">No Fap Streak</h3>
            <p className="text-xs text-muted-foreground font-mono">Giorni consecutivi senza masturbazione</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm font-mono">
          {state.streak} giorni
        </Badge>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Ultimo reset</span>
          <span className="font-mono">{state.lastReset}</span>
        </div>
        <div className="flex justify-between">
          <span>Aggiornato</span>
          <span className="font-mono">{state.lastUpdate}</span>
        </div>
      </div>

      <Button onClick={handleReset} variant="outline" className="mt-4 border-2 w-full gap-2">
        <RotateCcw className="h-4 w-4" />
        Reset Streak
      </Button>
    </Card>
  );
};
