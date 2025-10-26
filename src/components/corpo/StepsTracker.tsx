import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Footprints, Check, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface StepsSummary {
  weeklyCompleted: number;
  weeklyGoal: number;
  monthlyCompleted: number;
  monthlyGoal: number;
  streak: number;
  lastSuccess: string | null;
}

interface StepsTrackerProps {
  onSummaryChange?: (summary: StepsSummary) => void;
}

interface StepRecord {
  log_date: string;
  completed: boolean;
}

const getToday = () => new Date().toISOString().split("T")[0];

const shiftDate = (isoDate: string, deltaDays: number) => {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + deltaDays);
  return date.toISOString().split("T")[0];
};

const diffInDays = (from: string, to: string) => {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  return Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
};

const weeklyGoal = 7;
const monthlyGoal = 30;

export const StepsTracker = ({ onSummaryChange }: StepsTrackerProps) => {
  const [records, setRecords] = useState<StepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const today = getToday();
    const { data, error } = await supabase
      .from("steps_log")
      .select("log_date, completed")
      .order("log_date", { ascending: true });

    if (error) {
      console.error("Errore nel caricamento dei passi", error);
      setLoading(false);
      return;
    }

    let normalized = data ? [...data] : [];

    if (!normalized.some((record) => record.log_date === today)) {
      const { error: insertError } = await supabase
        .from("steps_log")
        .insert({ log_date: today, completed: false });
      if (insertError) {
        console.error("Errore nell'inserimento del giorno odierno", insertError);
      } else {
        normalized.push({ log_date: today, completed: false });
      }
    }

    normalized.sort((a, b) => (a.log_date < b.log_date ? -1 : 1));
    setRecords(normalized);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const today = getToday();
  const todayRecord = records.find((record) => record.log_date === today);
  const todayCompleted = todayRecord?.completed ?? false;

  const lastSuccess = useMemo(() => findLastSuccess(records), [records]);
  const streak = useMemo(() => computeStreak(records), [records]);
  const weeklyCompleted = useMemo(() => countCompletedInRange(records, 7), [records]);
  const monthlyCompleted = useMemo(() => countCompletedInRange(records, 30), [records]);

  useEffect(() => {
    if (!onSummaryChange) return;
    onSummaryChange({
      weeklyCompleted,
      weeklyGoal,
      monthlyCompleted,
      monthlyGoal,
      streak,
      lastSuccess,
    });
  }, [onSummaryChange, weeklyCompleted, monthlyCompleted, streak, lastSuccess]);

  const handleMarkCompleted = async () => {
    if (submitting) return;
    setSubmitting(true);
    const todayDate = getToday();
    const { error } = await supabase
      .from("steps_log")
      .upsert({ log_date: todayDate, completed: true }, { onConflict: "log_date" });

    if (error) {
      console.error("Errore nel segnare il completamento", error);
    } else {
      await loadRecords();
    }

    setSubmitting(false);
  };

  const handleReset = async () => {
    if (submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("steps_log").delete().neq("log_date", "1900-01-01");
    if (error) {
      console.error("Errore nel reset dei passi", error);
    }
    await loadRecords();
    setSubmitting(false);
  };

  return (
    <Card className="border-2 p-6 bg-corpo-light/20">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm border-2 bg-corpo-light">
            <Footprints className="h-5 w-5 text-corpo" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Steps Goal</h3>
            <p className="text-xs text-muted-foreground font-mono">Obiettivo quotidiano: 40k passi</p>
          </div>
        </div>
        <Badge variant={todayCompleted ? "default" : "secondary"} className="text-sm font-mono">
          {todayCompleted ? "COMPLETATO" : "DA FARE"}
        </Badge>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Consecutivi</span>
          <span className="font-mono">{streak} giorni</span>
        </div>
        <div className="flex justify-between">
          <span>Ultimo completamento</span>
          <span className="font-mono">{lastSuccess ?? "—"}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          onClick={handleMarkCompleted}
          disabled={loading || submitting || todayCompleted}
          className="border-2 flex-1 gap-2"
        >
          <Check className="h-4 w-4" />
          Segna completato
        </Button>
        <Button onClick={handleReset} variant="outline" className="border-2" size="icon" disabled={loading || submitting}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

const countCompletedInRange = (records: StepRecord[], rangeDays: number) => {
  const today = getToday();
  return records.reduce((acc, record) => {
    if (!record.completed) return acc;
    const diff = diffInDays(record.log_date, today);
    if (diff >= 0 && diff < rangeDays) {
      return acc + 1;
    }
    return acc;
  }, 0);
};

const computeStreak = (records: StepRecord[]) => {
  const today = getToday();
  const recordMap = new Map(records.map((record) => [record.log_date, record.completed]));
  let currentDate = today;
  let streak = 0;

  while (recordMap.get(currentDate)) {
    streak += 1;
    currentDate = shiftDate(currentDate, -1);
  }

  return streak;
};

const findLastSuccess = (records: StepRecord[]) => {
  const sorted = [...records].filter((record) => record.completed).sort((a, b) => (a.log_date < b.log_date ? -1 : 1));
  if (sorted.length === 0) return null;
  return sorted[sorted.length - 1].log_date;
};

export type { StepsSummary };
