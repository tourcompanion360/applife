import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Task, SubTask } from "@/components/soldi/TaskList";

export type TourPhase = "Development" | "Costruzione" | "Marketing" | "Testing";

interface TourTaskRow {
  id: string;
  phase: TourPhase;
  title: string;
  priority: Task["priority"] | null;
  completed: boolean | null;
  subtasks?: TourSubtaskRow[];
}

interface TourSubtaskRow {
  id: string;
  title: string;
  completed: boolean | null;
  task_id: string;
}

const createEmptyPhaseMap = (): Record<TourPhase, Task[]> => ({
  Development: [],
  Costruzione: [],
  Marketing: [],
  Testing: [],
});

const normalizeSubtasks = (rows?: TourSubtaskRow[]): SubTask[] =>
  (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    completed: row.completed ?? false,
  }));

const normalizeTasks = (rows: TourTaskRow[]): Record<TourPhase, Task[]> => {
  const map: Record<TourPhase, Task[]> = {
    Development: [],
    Costruzione: [],
    Marketing: [],
    Testing: [],
  };

  rows.forEach((row) => {
    const phase = row.phase ?? "Development";
    map[phase] = [
      ...map[phase],
      {
        id: row.id,
        title: row.title,
        completed: row.completed ?? false,
        priority: (row.priority ?? "normale") as Task["priority"],
        category: phase,
        subtasks: normalizeSubtasks(row.subtasks),
      },
    ];
  });

  return map;
};

export const useTourTasksService = () => {
  const [tasksByPhase, setTasksByPhase] = useState<Record<TourPhase, Task[]>>(createEmptyPhaseMap());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tour_tasks")
      .select("id, phase, title, priority, completed, subtasks:tour_subtasks(id, title, completed, task_id)")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Errore nel caricamento dei task Tour Companion", error);
      setTasksByPhase(createEmptyPhaseMap());
      setLoading(false);
      return;
    }

    setTasksByPhase(normalizeTasks(data as TourTaskRow[]));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel("tour_tasks_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tour_tasks" }, () => {
        void refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tour_subtasks" }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addTask = useCallback(
    async (phase: TourPhase, title: string, priority: Task["priority"]) => {
      const { error } = await supabase.from("tour_tasks").insert({ phase, title, priority });
      if (error) {
        console.error("Errore nell'aggiunta del task Tour Companion", error);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const toggleTaskCompletion = useCallback(async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from("tour_tasks")
      .update({ completed })
      .eq("id", taskId);
    if (error) {
      console.error("Errore nel toggling del task Tour Companion", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const deleteTask = useCallback(async (taskId: string) => {
    const { error } = await supabase.from("tour_tasks").delete().eq("id", taskId);
    if (error) {
      console.error("Errore nella cancellazione del task Tour Companion", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const addSubtask = useCallback(async (taskId: string, title: string) => {
    const { error } = await supabase.from("tour_subtasks").insert({ task_id: taskId, title });
    if (error) {
      console.error("Errore nell'aggiunta della subtask Tour Companion", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const toggleSubtaskCompletion = useCallback(async (subtaskId: string, completed: boolean) => {
    const { error } = await supabase
      .from("tour_subtasks")
      .update({ completed })
      .eq("id", subtaskId);
    if (error) {
      console.error("Errore nel toggling della subtask Tour Companion", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    const { error } = await supabase.from("tour_subtasks").delete().eq("id", subtaskId);
    if (error) {
      console.error("Errore nella cancellazione della subtask Tour Companion", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const flatTasks = useMemo(() => Object.values(tasksByPhase).flat(), [tasksByPhase]);

  return {
    tasksByPhase,
    flatTasks,
    loading,
    refresh,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    addSubtask,
    toggleSubtaskCompletion,
    deleteSubtask,
  };
};
