import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ExperienceCategory = "natura" | "hobby" | "lettura" | "progetti";

export interface ExperienceEntry {
  id: string;
  title: string;
  category: ExperienceCategory;
  dateLabel: string;
  description: string;
  createdAt: string;
}

interface ExperienceRow {
  id: string;
  title: string;
  category: ExperienceCategory | null;
  date_label: string | null;
  description: string | null;
  created_at: string | null;
}

const normalizeExperience = (row: ExperienceRow): ExperienceEntry => ({
  id: row.id,
  title: row.title,
  category: (row.category ?? "natura") as ExperienceCategory,
  dateLabel: row.date_label ?? "Oggi",
  description: row.description ?? "",
  createdAt: row.created_at ?? new Date().toISOString(),
});

export const useExperienceService = () => {
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("experiences")
      .select("id, title, category, date_label, description, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore nel caricamento delle esperienze", error);
      setExperiences([]);
      setLoading(false);
      return;
    }

    setExperiences((data ?? []).map(normalizeExperience));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel("experiences_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "experiences" }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addExperience = useCallback(
    async (title: string, category: ExperienceCategory, dateLabel: string, description: string) => {
      const { error } = await supabase
        .from("experiences")
        .insert({ title, category, date_label: dateLabel, description });

      if (error) {
        console.error("Errore nell'aggiunta dell'esperienza", error);
        return false;
      }

      await refresh();
      return true;
    },
    [refresh],
  );

  const experiencesByCategory = useMemo(
    () =>
      experiences.reduce<Record<ExperienceCategory, ExperienceEntry[]>>(
        (acc, exp) => {
          acc[exp.category] = [...acc[exp.category], exp];
          return acc;
        },
        {
          natura: [],
          hobby: [],
          lettura: [],
          progetti: [],
        },
      ),
    [experiences],
  );

  const getExperienceById = useCallback(
    (id: string) => experiences.find((exp) => exp.id === id) ?? null,
    [experiences],
  );

  const deleteExperience = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) {
        console.error("Errore nella cancellazione dell'esperienza", error);
        return false;
      }

      await refresh();
      return true;
    },
    [refresh],
  );

  return {
    experiences,
    experiencesByCategory,
    loading,
    refresh,
    addExperience,
    getExperienceById,
    deleteExperience,
  };
};
