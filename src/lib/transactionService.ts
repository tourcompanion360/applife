import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  description?: string;
  project?: string;
  created_at: string;
}

export const useTransactionService = () => {
  const loadTransactions = useCallback(async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Errore nel caricamento delle transazioni", error);
      return [];
    }

    return data || [];
  }, []);

  const addTransaction = useCallback(
    async (
      date: string,
      type: 'income' | 'expense',
      amount: number,
      category?: string,
      description?: string,
      project?: string
    ): Promise<boolean> => {
      const { error } = await supabase.from("transactions").insert({
        date,
        type,
        amount,
        category,
        description,
        project,
      });

      if (error) {
        console.error("Errore nell'aggiunta della transazione", error);
        return false;
      }

      return true;
    },
    []
  );

  const removeTransaction = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Errore nella rimozione della transazione", error);
      return false;
    }

    return true;
  }, []);

  return { loadTransactions, addTransaction, removeTransaction };
};
