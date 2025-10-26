import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface WellbeingEntry {
  id: string;
  log_date: string;
  mood_morning?: number;
  mood_evening?: number;
  energy_morning?: number;
  energy_evening?: number;
  momentum?: number;
  reflection?: string;
  created_at: string;
}

export interface SleepEntry {
  id: string;
  log_date: string;
  bedtime?: string;
  wake_time?: string;
  duration_minutes?: number;
  quality?: number;
  notes?: string;
  created_at: string;
}

export const useWellbeingService = () => {
  const loadWellbeingEntries = useCallback(async (): Promise<WellbeingEntry[]> => {
    const { data, error } = await supabase
      .from("wellbeing_log")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(7);

    if (error) {
      console.error("Errore nel caricamento del benessere", error);
      return [];
    }

    return data || [];
  }, []);

  const loadSleepEntries = useCallback(async (): Promise<SleepEntry[]> => {
    const { data, error } = await supabase
      .from("sleep_log")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(7);

    if (error) {
      console.error("Errore nel caricamento del sonno", error);
      return [];
    }

    return data || [];
  }, []);

  const addWellbeingEntry = useCallback(
    async (
      moodMorning?: number,
      moodEvening?: number,
      energyMorning?: number,
      energyEvening?: number,
      momentum?: number,
      reflection?: string
    ): Promise<boolean> => {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("wellbeing_log").upsert({
        log_date: today,
        mood_morning: moodMorning,
        mood_evening: moodEvening,
        energy_morning: energyMorning,
        energy_evening: energyEvening,
        momentum,
        reflection,
      }, { onConflict: "log_date" });

      if (error) {
        console.error("Errore nell'aggiunta del benessere", error);
        return false;
      }

      return true;
    },
    []
  );

  const addSleepEntry = useCallback(
    async (
      bedtime?: string,
      wakeTime?: string,
      duration?: number,
      quality?: number,
      notes?: string
    ): Promise<boolean> => {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("sleep_log").upsert({
        log_date: today,
        bedtime,
        wake_time: wakeTime,
        duration_minutes: duration,
        quality,
        notes,
      }, { onConflict: "log_date" });

      if (error) {
        console.error("Errore nell'aggiunta del sonno", error);
        return false;
      }

      return true;
    },
    []
  );

  return { loadWellbeingEntries, loadSleepEntries, addWellbeingEntry, addSleepEntry };
};
