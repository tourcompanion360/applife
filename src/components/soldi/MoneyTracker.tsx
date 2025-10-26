import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export type TransactionType = "income" | "expense";

export interface MoneyTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

interface MoneyTrackerProps {
  transactions: MoneyTransaction[];
  onAddTransaction: (transaction: Omit<MoneyTransaction, "id">) => void;
  onRemoveTransaction: (id: string) => void;
}

const categories = ["Tour Companion", "Virtual Tour", "Trading", "Finance", "Altro"];

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const MoneyTracker = ({ transactions, onAddTransaction, onRemoveTransaction }: MoneyTrackerProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("income");
  const [category, setCategory] = useState<string>(categories[0]);

  const { income, expenses, net } = useMemo(() => {
    const totals = transactions.reduce(
      (acc, tx) => {
        if (tx.type === "income") {
          acc.income += tx.amount;
        } else {
          acc.expenses += tx.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 },
    );

    return { ...totals, net: totals.income - totals.expenses };
  }, [transactions]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
    });

    setDescription("");
    setAmount("");
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 p-4 bg-muted/20">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Entrate</p>
            <p className="text-2xl font-semibold text-green-400">
              {currencyFormatter.format(income)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Uscite</p>
            <p className="text-2xl font-semibold text-red-400">
              {currencyFormatter.format(expenses)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Netto</p>
            <p className={`text-2xl font-semibold ${net >= 0 ? "text-green-300" : "text-red-300"}`}>
              {currencyFormatter.format(net)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-2 p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Descrizione"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="border-2"
          />
          <Input
            placeholder="Importo"
            type="number"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="border-2"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="inline-flex rounded-md border-2 p-1 bg-muted/40">
            <Button
              type="button"
              size="sm"
              variant={type === "income" ? "default" : "ghost"}
              onClick={() => setType("income")}
              className="border-0"
            >
              Entrata
            </Button>
            <Button
              type="button"
              size="sm"
              variant={type === "expense" ? "default" : "ghost"}
              onClick={() => setType("expense")}
              className="border-0"
            >
              Uscita
            </Button>
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-2 w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" onClick={handleSubmit} className="border-2">
            Aggiungi movimento
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {transactions.length === 0 && (
          <Card className="border-2 p-4 text-sm text-muted-foreground">
            Nessun movimento registrato oggi.
          </Card>
        )}

        {transactions.map((transaction) => (
          <Card key={transaction.id} className="border-2 p-4 flex items-center gap-3 bg-card/40">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold truncate">{transaction.description}</p>
                <Badge
                  variant={transaction.type === "income" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {transaction.type === "income" ? "ENTRATA" : "USCITA"}
                </Badge>
                <Badge variant="outline" className="text-xs border-2">
                  {transaction.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {currencyFormatter.format(transaction.amount)}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemoveTransaction(transaction.id)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
