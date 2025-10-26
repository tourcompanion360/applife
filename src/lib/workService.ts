import { supabase } from "@/lib/supabaseClient";

export interface WorkEntry {
  id: string;
  log_date: string;
  project: string;
  client?: string;
  deep_minutes: number;
  shallow_minutes: number;
  notes?: string;
  created_at: string;
}

export interface LeadEntry {
  id: string;
  log_date: string;
  channel: string;
  count: number;
  project?: string;
  notes?: string;
  created_at: string;
}

export interface RevenueEntry {
  id: string;
  week_start: string;
  amount: number;
  source?: string;
  notes?: string;
  created_at: string;
}

export const useWorkService = () => {
  const loadWorkEntries = async (limit = 10): Promise<WorkEntry[]> => {
    const { data, error } = await supabase
      .from("work_log")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Errore nel caricamento del lavoro", error);
      return [];
    }

    return data || [];
  };

  const loadLeadEntries = async (limit = 10): Promise<LeadEntry[]> => {
    const { data, error } = await supabase
      .from("leads_log")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Errore nel caricamento dei lead", error);
      return [];
    }

    return data || [];
  };

  const loadRevenueEntries = async (limit = 10): Promise<RevenueEntry[]> => {
    const { data, error } = await supabase
      .from("revenue_log")
      .select("*")
      .order("week_start", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Errore nel caricamento delle entrate", error);
      return [];
    }

    return data || [];
  };

  const addWorkEntry = async (
    project: string,
    client?: string,
    deepMinutes = 0,
    shallowMinutes = 0,
    notes?: string
  ): Promise<boolean> => {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("work_log").insert({
      log_date: today,
      project,
      client,
      deep_minutes: deepMinutes,
      shallow_minutes: shallowMinutes,
      notes,
    });

    if (error) {
      console.error("Errore nell'aggiunta del lavoro", error);
      return false;
    }

    return true;
  };

  const addLeadEntry = async (
    channel: string,
    count = 1,
    project?: string,
    notes?: string
  ): Promise<boolean> => {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("leads_log").insert({
      log_date: today,
      channel,
      count,
      project,
      notes,
    });

    if (error) {
      console.error("Errore nell'aggiunta dei lead", error);
      return false;
    }

    return true;
  };

  const addRevenueEntry = async (
    weekStart: string,
    amount: number,
    source?: string,
    notes?: string
  ): Promise<boolean> => {
    const { error } = await supabase.from("revenue_log").insert({
      week_start: weekStart,
      amount,
      source,
      notes,
    });

    if (error) {
      console.error("Errore nell'aggiunta delle entrate", error);
      return false;
    }

    return true;
  };

  return { loadWorkEntries, loadLeadEntries, loadRevenueEntries, addWorkEntry, addLeadEntry, addRevenueEntry };
};
