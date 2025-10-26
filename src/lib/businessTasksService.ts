import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Task, SubTask } from "@/components/soldi/TaskList";

export type BusinessArea = "Business" | "Mente" | "Corpo" | "Generale";

interface BusinessTaskRow {
  id: string;
  area: BusinessArea | null;
  title: string;
  priority: Task["priority"] | null;
  completed: boolean | null;
  subtasks?: BusinessSubtaskRow[];
}

interface BusinessSubtaskRow {
  id: string;
  task_id: string;
  title: string;
  completed: boolean | null;
}

const normalizeSubtasks = (rows?: BusinessSubtaskRow[]): SubTask[] =>
  (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    completed: row.completed ?? false,
  }));

const normalizeTasks = (rows: BusinessTaskRow[]): Task[] =>
  rows.map((row) => ({
    id: row.id,
    title: row.title,
    completed: row.completed ?? false,
    priority: (row.priority ?? "normale") as Task["priority"],
    category: row.area ?? "Business",
    subtasks: normalizeSubtasks(row.subtasks),
  }));

export const useBusinessTasksService = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("business_tasks")
      .select("id, area, title, priority, completed, subtasks:business_subtasks(id, task_id, title, completed)")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Errore nel caricamento dei task business", error);
      setTasks([]);
      setLoading(false);
      return;
    }

    setTasks(normalizeTasks(data as BusinessTaskRow[]));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel("business_tasks_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "business_tasks" }, () => {
        void refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "business_subtasks" }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addTask = useCallback(async (area: BusinessArea, title: string, priority: Task["priority"]) => {
    const { error } = await supabase.from("business_tasks").insert({ area, title, priority });
    if (error) {
      console.error("Errore nell'aggiunta del task business", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const toggleTaskCompletion = useCallback(async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from("business_tasks")
      .update({ completed })
      .eq("id", taskId);
    if (error) {
      console.error("Errore nel toggling del task business", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const deleteTask = useCallback(async (taskId: string) => {
    const { error } = await supabase.from("business_tasks").delete().eq("id", taskId);
    if (error) {
      console.error("Errore nella cancellazione del task business", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const addSubtask = useCallback(async (taskId: string, title: string) => {
    const { error } = await supabase.from("business_subtasks").insert({ task_id: taskId, title });
    if (error) {
      console.error("Errore nell'aggiunta della subtask business", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const toggleSubtaskCompletion = useCallback(async (subtaskId: string, completed: boolean) => {
    const { error } = await supabase
      .from("business_subtasks")
      .update({ completed })
      .eq("id", subtaskId);
    if (error) {
      console.error("Errore nel toggling della subtask business", error);
      return;
    }
    await refresh();
  }, [refresh]);

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    const { error } = await supabase.from("business_subtasks").delete().eq("id", subtaskId);
    if (error) {
      console.error("Errore nella cancellazione della subtask business", error);
      return;
    }
    await refresh();
  }, [refresh]);

  return {
    tasks,
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
