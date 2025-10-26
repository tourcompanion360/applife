import { supabase } from "@/lib/supabaseClient";

export interface WeightEntry {
  id: string;
  measured_at: string;
  weight_kg: number;
  bodyfat_pct?: number;
  waist_cm?: number;
  penis_cm?: number;
  notes?: string;
  created_at: string;
}

export const useWeightEntries = () => {
  const loadEntries = async (): Promise<WeightEntry[]> => {
    const { data, error } = await supabase
      .from("weight_entries")
      .select("*")
      .order("measured_at", { ascending: false });

    if (error) {
      console.error("Errore nel caricamento delle entrate di peso", error);
      return [];
    }

    return data || [];
  };

  const addEntry = async (
    weight: number,
    bodyfat?: number,
    waist?: number,
    penis?: number
  ): Promise<boolean> => {
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("weight_entries").insert({
      measured_at: today,
      weight_kg: weight,
      bodyfat_pct: bodyfat,
      waist_cm: waist,
      penis_cm: penis,
    });

    if (error) {
      console.error("Errore nell'aggiunta dell'entrata di peso", error);
      return false;
    }

    return true;
  };

  return { loadEntries, addEntry };
};
