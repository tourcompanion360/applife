import { useCallback, useEffect, useMemo, useState } from "react";
import { startOfWeek, formatISO } from "date-fns";
import { supabase } from "@/lib/supabaseClient";

export interface WorkoutDayLog {
  id: string;
  logDate: string;
  weekStart: string;
  dayLabel: string;
  completed: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WorkoutDayLogRow {
  id: string;
  log_date: string;
  week_start: string;
  day_label: string;
  completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_WORKOUT_PLAN = [
  {
    day: "Lunedì",
    focus: "Petto + Tricipiti",
    exercises: [
      { name: "Panca piana con manubri", notes: "4x10 · discesa controllata 3 sec" },
      { name: "Panca inclinata", notes: "4x12 · inclina appoggiando la panca" },
      { name: "Croci su panca piana", notes: "3x15" },
      { name: "Push down carrucola", notes: "4x12" },
      { name: "French press manubrio singolo", notes: "3x10 dietro la testa" },
      { name: "Dips tra due sedie", notes: "3x max · anche parziali" },
    ],
  },
  {
    day: "Martedì",
    focus: "Schiena + Bicipiti",
    exercises: [
      { name: "Rematore con manubrio singolo", notes: "4x10 per lato" },
      { name: "Rematore con due manubri stile pendlay", notes: "3x12" },
      { name: "Trazioni negative", notes: "3x6 · discesa 5-7 sec" },
      { name: "Curl con manubri alternato", notes: "4x12" },
      { name: "Curl concentrato su panca", notes: "3x10" },
      { name: "Curl presa martello", notes: "3x12" },
    ],
  },
  {
    day: "Mercoledì",
    focus: "Gambe + Addome",
    exercises: [
      { name: "Squat con manubri", notes: "4x15" },
      { name: "Affondi statici", notes: "4x12 per gamba" },
      { name: "Stacchi rumeni con manubri", notes: "4x12" },
      { name: "Calf raises", notes: "4x20" },
      { name: "Crunch su panca", notes: "3x20" },
      { name: "Plank", notes: "3x 45-60 sec" },
    ],
  },
  {
    day: "Giovedì",
    focus: "Spalle + Tricipiti",
    exercises: [
      { name: "Military press con manubri", notes: "4x10" },
      { name: "Alzate laterali", notes: "4x15" },
      { name: "Alzate frontali", notes: "3x12" },
      { name: "Push down carrucola presa stretta", notes: "4x12" },
      { name: "Estensioni dietro la testa", notes: "3x10" },
      { name: "Dips parziali", notes: "3x max" },
    ],
  },
  {
    day: "Venerdì",
    focus: "Schiena + Bicipiti",
    exercises: [
      { name: "Rematore unilaterale con manubrio", notes: "4x10" },
      { name: "Trazioni negative", notes: "3x6" },
      { name: "Curl con supinazione", notes: "4x12" },
      { name: "Curl a 21", notes: "3 serie" },
      { name: "Reverse curl", notes: "3x12" },
    ],
  },
  {
    day: "Sabato",
    focus: "Full body + Addome",
    exercises: [
      { name: "Panca piana con manubri", notes: "4x10" },
      { name: "Rematore con manubrio", notes: "4x10" },
      { name: "Squat con manubri", notes: "4x15" },
      { name: "Military press", notes: "3x12" },
      { name: "Curl + French press superset", notes: "3x12+12" },
      { name: "Crunch + Plank", notes: "3 giri" },
    ],
  },
  {
    day: "Domenica",
    focus: "Recupero",
    exercises: [
      { name: "Riposo attivo / mobilità leggera", notes: "Respira, stretching, journaling" },
    ],
  },
] as const;

export type WorkoutTemplate = (typeof DEFAULT_WORKOUT_PLAN)[number];

const mapRow = (row: WorkoutDayLogRow): WorkoutDayLog => ({
  id: row.id,
  logDate: row.log_date,
  weekStart: row.week_start,
  dayLabel: row.day_label,
  completed: row.completed,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const useWorkoutService = () => {
  const [weekStart, setWeekStart] = useState<string>(() => formatISO(startOfWeek(new Date(), { weekStartsOn: 1 }), { representation: "date" }));
  const [logs, setLogs] = useState<WorkoutDayLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    async (targetWeekStart?: string) => {
      const effectiveWeekStart = targetWeekStart ?? weekStart;
      setLoading(true);
      const { data, error } = await supabase
        .from("workout_day_logs")
        .select("id, log_date, week_start, day_label, completed, notes, created_at, updated_at")
        .eq("week_start", effectiveWeekStart)
        .order("log_date", { ascending: true });

      if (error) {
        console.error("Errore nel caricamento dei workout logs", error);
        setLogs([]);
        setLoading(false);
        return;
      }

      const mapped = ((data ?? []) as unknown as WorkoutDayLogRow[]).map(mapRow);
      setLogs(mapped);
      setLoading(false);
    },
    [weekStart],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel("workout_day_logs_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "workout_day_logs" }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const ensureEntry = useCallback(
    async (dayLabel: string) => {
      const today = new Date();
      const currentWeekStart = formatISO(startOfWeek(today, { weekStartsOn: 1 }), { representation: "date" });
      setWeekStart(currentWeekStart);

      const existing = logs.find((log) => log.dayLabel === dayLabel && log.weekStart === currentWeekStart);
      if (existing) {
        return existing;
      }

      const logDate = formatISO(today, { representation: "date" });
      const { data, error } = await supabase
        .from("workout_day_logs")
        .insert({
          log_date: logDate,
          week_start: currentWeekStart,
          day_label: dayLabel,
          completed: false,
        })
        .select("id, log_date, week_start, day_label, completed, notes, created_at, updated_at")
        .single();

      if (error) {
        console.error("Errore nella creazione del log workout", error);
        return null;
      }

      const mapped = mapRow(data as unknown as WorkoutDayLogRow);
      setLogs((prev) => [...prev.filter((l) => l.id !== mapped.id), mapped]);
      return mapped;
    },
    [logs],
  );

  const setCompletion = useCallback(
    async (dayLabel: string, completed: boolean) => {
      const entry = await ensureEntry(dayLabel);
      if (!entry) return false;

      const { error } = await supabase
        .from("workout_day_logs")
        .update({ completed })
        .eq("id", entry.id);

      if (error) {
        console.error("Errore nell'aggiornamento del log workout", error);
        return false;
      }

      setLogs((prev) => prev.map((log) => (log.id === entry.id ? { ...log, completed } : log)));
      return true;
    },
    [ensureEntry],
  );

  const setNotes = useCallback(
    async (dayLabel: string, notes: string | null) => {
      const entry = await ensureEntry(dayLabel);
      if (!entry) return false;

      const { error } = await supabase
        .from("workout_day_logs")
        .update({ notes })
        .eq("id", entry.id);

      if (error) {
        console.error("Errore nell'aggiornamento delle note workout", error);
        return false;
      }

      setLogs((prev) => prev.map((log) => (log.id === entry.id ? { ...log, notes: notes ?? null } : log)));
      return true;
    },
    [ensureEntry],
  );

  const goToWeek = useCallback(
    async (offset: number) => {
      const current = startOfWeek(new Date(weekStart), { weekStartsOn: 1 });
      const target = new Date(current);
      target.setDate(current.getDate() + offset * 7);
      const nextWeekStart = formatISO(target, { representation: "date" });
      setWeekStart(nextWeekStart);
      await refresh(nextWeekStart);
    },
    [weekStart, refresh],
  );

  const logsByDay = useMemo(() => {
    const map = new Map<string, WorkoutDayLog>();
    for (const log of logs) {
      map.set(log.dayLabel, log);
    }
    return map;
  }, [logs]);

  return {
    weekStart,
    logs,
    logsByDay,
    loading,
    refresh,
    setCompletion,
    setNotes,
    goToWeek,
  };
};
