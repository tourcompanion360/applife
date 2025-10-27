import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface FocusSessionTask {
  id: string;
  title: string;
  completed: boolean;
  metricLabel?: string | null;
  targetValue?: number | null;
  resultValue?: number | null;
  sortOrder: number;
}

export interface FocusSession {
  id: string;
  sessionDate: string;
  title: string;
  goal?: string | null;
  plannedMinutes?: number | null;
  actualMinutes?: number | null;
  status: "planned" | "in_progress" | "completed";
  notes?: string | null;
  createdAt: string;
  isRunning: boolean;
  startedAt?: string | null;
  elapsedSeconds: number;
  tasks: FocusSessionTask[];
}

interface FocusSessionRow {
  id: string;
  session_date: string;
  title: string;
  goal: string | null;
  planned_minutes: number | null;
  actual_minutes: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  is_running: boolean;
  started_at: string | null;
  elapsed_seconds: number;
  tasks: FocusSessionTaskRow[] | null;
}

interface FocusSessionTaskRow {
  id: string;
  title: string;
  completed: boolean;
  metric_label: string | null;
  target_value: number | null;
  result_value: number | null;
  sort_order: number;
}

const mapTask = (row: FocusSessionTaskRow): FocusSessionTask => ({
  id: row.id,
  title: row.title,
  completed: row.completed,
  metricLabel: row.metric_label,
  targetValue: row.target_value,
  resultValue: row.result_value,
  sortOrder: row.sort_order,
});

const mapSession = (row: FocusSessionRow): FocusSession => ({
  id: row.id,
  sessionDate: row.session_date,
  title: row.title,
  goal: row.goal,
  plannedMinutes: row.planned_minutes,
  actualMinutes: row.actual_minutes,
  status: (row.status as FocusSession["status"]) ?? "planned",
  notes: row.notes,
  createdAt: row.created_at,
  isRunning: row.is_running ?? false,
  startedAt: row.started_at,
  elapsedSeconds: row.elapsed_seconds ?? 0,
  tasks: (row.tasks ?? []).map(mapTask).sort((a, b) => a.sortOrder - b.sortOrder),
});

export const useFocusService = () => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("focus_sessions")
      .select(
        "id, session_date, title, goal, planned_minutes, actual_minutes, status, notes, created_at, " +
          "is_running, started_at, elapsed_seconds, " +
          "tasks:focus_session_tasks(id, title, completed, metric_label, target_value, result_value, sort_order)"
      )
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore nel caricamento delle focus session", error);
      setSessions([]);
      setLoading(false);
      return;
    }

    const rows = ((data ?? []) as unknown) as FocusSessionRow[];
    setSessions(rows.map(mapSession));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel("focus_sessions_change")
      .on("postgres_changes", { event: "*", schema: "public", table: "focus_sessions" }, () => {
        void refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "focus_session_tasks" }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const createSession = useCallback(
    async (title: string, goal: string | undefined, plannedMinutes?: number) => {
      const { data, error } = await supabase
        .from("focus_sessions")
        .insert({ title, goal, planned_minutes: plannedMinutes })
        .select(
          "id, session_date, title, goal, planned_minutes, actual_minutes, status, notes, created_at, is_running, started_at, elapsed_seconds",
        )
        .single();

      if (error) {
        console.error("Errore nella creazione della focus session", error);
        return null;
      }

      const newSession = mapSession({ ...data, tasks: [] } as FocusSessionRow);
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    },
    [],
  );

  const updateSession = useCallback(
    async (
      id: string,
      patch: Partial<{
        goal: string;
        plannedMinutes: number | null;
        actualMinutes: number | null;
        status: FocusSession["status"];
        notes: string | null;
        sessionDate: string;
        isRunning: boolean;
        startedAt: string | null;
        elapsedSeconds: number;
      }>,
    ) => {
      const updatePayload = Object.fromEntries(
        Object.entries({
          goal: patch.goal,
          planned_minutes: patch.plannedMinutes,
          actual_minutes: patch.actualMinutes,
          status: patch.status,
          notes: patch.notes,
          session_date: patch.sessionDate,
          is_running: patch.isRunning,
          started_at: patch.startedAt,
          elapsed_seconds: patch.elapsedSeconds,
        }).filter(([, value]) => value !== undefined),
      );

      const { error } = await supabase
        .from("focus_sessions")
        .update(updatePayload)
        .eq("id", id);

      if (error) {
        console.error("Errore nell'aggiornamento della focus session", error);
        return false;
      }

      await refresh();
      return true;
    },
    [refresh],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("focus_sessions").delete().eq("id", id);
      if (error) {
        console.error("Errore nella cancellazione della focus session", error);
        return false;
      }

      await refresh();
      return true;
    },
    [refresh],
  );

  const addTask = useCallback(
    async (sessionId: string, title: string) => {
      const { error } = await supabase.from("focus_session_tasks").insert({ session_id: sessionId, title });
      if (error) {
        console.error("Errore nell'aggiunta del task della focus session", error);
        return false;
      }

      await refresh();
      return true;
    },
    [refresh],
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string, completed: boolean) => {
      const { error } = await supabase
        .from("focus_session_tasks")
        .update({ completed })
        .eq("id", taskId);

      if (error) {
        console.error("Errore nel toggle del task della focus session", error);
        return false;
      }

      await refresh();
      return true;
    },
    [refresh],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const { error } = await supabase.from("focus_session_tasks").delete().eq("id", taskId);

      if (error) {
        console.error("Errore nella cancellazione del task della focus session", error);
        return false;
      }

      await refresh();
      return true;
    },
    [refresh],
  );

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()),
    [sessions],
  );

  return {
    sessions: sortedSessions,
    loading,
    refresh,
    createSession,
    updateSession,
    deleteSession,
    addTask,
    toggleTaskCompletion,
    deleteTask,
  };
};
