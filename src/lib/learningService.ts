import { supabase } from "@/lib/supabaseClient";

export interface LearningEntry {
  id: string;
  log_date: string;
  skill: string;
  resource_type: string;
  resource_title?: string;
  duration_minutes?: number;
  insight?: string;
  created_at: string;
}

export interface ReflectionEntry {
  id: string;
  log_date: string;
  insight: string;
  created_at: string;
}

export const useLearningService = () => {
  const loadLearningEntries = async (limit = 10): Promise<LearningEntry[]> => {
    const { data, error } = await supabase
      .from("learning_log")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Errore nel caricamento dell'apprendimento", error);
      return [];
    }

    return data || [];
  };

  const loadReflectionEntries = async (limit = 10): Promise<ReflectionEntry[]> => {
    const { data, error } = await supabase
      .from("reflections")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Errore nel caricamento delle riflessioni", error);
      return [];
    }

    return data || [];
  };

  const addLearningEntry = async (
    skill: string,
    resourceType: string,
    resourceTitle?: string,
    durationMinutes?: number,
    insight?: string
  ): Promise<boolean> => {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("learning_log").insert({
      log_date: today,
      skill,
      resource_type: resourceType,
      resource_title: resourceTitle,
      duration_minutes: durationMinutes,
      insight,
    });

    if (error) {
      console.error("Errore nell'aggiunta dell'apprendimento", error);
      return false;
    }

    return true;
  };

  const addReflectionEntry = async (insight: string): Promise<boolean> => {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("reflections").upsert({
      log_date: today,
      insight,
    }, { onConflict: "log_date" });

    if (error) {
      console.error("Errore nell'aggiunta della riflessione", error);
      return false;
    }

    return true;
  };

  return { loadLearningEntries, loadReflectionEntries, addLearningEntry, addReflectionEntry };
};
