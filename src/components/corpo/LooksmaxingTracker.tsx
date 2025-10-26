import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";

type LooksmaxingCategory =
  | "skincare"
  | "supplementi"
  | "soft"
  | "social"
  | "mentalita"
  | "focus"
  | "idratazione";

interface LooksmaxingItem {
  id: string;
  title: string;
  category: LooksmaxingCategory;
  completed: boolean;
  priority: "alta" | "normale";
}

const categoryOptions: { value: LooksmaxingCategory; label: string; badgeClass: string }[] = [
  { value: "skincare", label: "Skincare", badgeClass: "bg-mente-light text-foreground" },
  { value: "supplementi", label: "Supplementi", badgeClass: "bg-soldi-light text-soldi" },
  { value: "soft", label: "Soft Maxxing", badgeClass: "bg-muted text-foreground" },
  { value: "social", label: "Social Maxxing", badgeClass: "bg-mente/30 text-foreground" },
  { value: "mentalita", label: "Mentalità", badgeClass: "bg-mente-light text-foreground" },
  { value: "focus", label: "Focus estetico", badgeClass: "bg-corpo-light text-foreground" },
  { value: "idratazione", label: "Idratazione & Sodio", badgeClass: "bg-muted/70 text-foreground" },
];

const categoryMap = categoryOptions.reduce(
  (acc, option) => {
    acc[option.value] = option;
    return acc;
  },
  {} as Record<LooksmaxingCategory, (typeof categoryOptions)[number]>,
);

export const LooksmaxingTracker = () => {
  const [items, setItems] = useState<LooksmaxingItem[]>([
    {
      id: "looks-1",
      title: "Skincare base: detersione, vitamina C, crema idratante, SPF",
      category: "skincare",
      completed: false,
      priority: "alta",
    },
    {
      id: "looks-2",
      title: "Supplementi: Ashwagandha + Tongkat Ali",
      category: "supplementi",
      completed: false,
      priority: "alta",
    },
    {
      id: "looks-3",
      title: "Melatonina serale per qualità del sonno",
      category: "supplementi",
      completed: false,
      priority: "normale",
    },
    {
      id: "looks-4",
      title: "Multivitaminico con la colazione",
      category: "supplementi",
      completed: false,
      priority: "normale",
    },
    {
      id: "looks-5",
      title: "Soft maxxing: outfit curato, capelli in ordine, accessori",
      category: "soft",
      completed: false,
      priority: "normale",
    },
    {
      id: "looks-6",
      title: "Grooming dettagli: sopracciglia, ciglia, labbra",
      category: "focus",
      completed: false,
      priority: "alta",
    },
    {
      id: "looks-7",
      title: "Igiene + denti impeccabili (focus: sorriso)",
      category: "focus",
      completed: false,
      priority: "alta",
    },
    {
      id: "looks-8",
      title: "Routine Social-Maxxing: 3 interazioni positive",
      category: "social",
      completed: false,
      priority: "normale",
    },
    {
      id: "looks-9",
      title: "Mentality maxxing: journaling obiettivo/purpose del giorno",
      category: "mentalita",
      completed: false,
      priority: "alta",
    },
    {
      id: "looks-10",
      title: "Postura & altezza: stretching + decompressione 10 minuti",
      category: "focus",
      completed: false,
      priority: "normale",
    },
    {
      id: "looks-11",
      title: "Protocollo sodio/acqua: aggiorna valori del giorno",
      category: "idratazione",
      completed: false,
      priority: "alta",
    },
    {
      id: "looks-12",
      title: "Check mentale: gratitudine, confidenza e confini sani",
      category: "mentalita",
      completed: false,
      priority: "normale",
    },
  ]);

  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<LooksmaxingCategory>("skincare");
  const [newPriority, setNewPriority] = useState<"alta" | "normale">("normale");

  const completedCount = useMemo(() => items.filter((item) => item.completed).length, [items]);

  const addItem = () => {
    if (!newItem.trim()) return;

    setItems([
      ...items,
      {
        id: Date.now().toString(),
        title: newItem,
        category: newCategory,
        completed: false,
        priority: newPriority,
      },
    ]);
    setNewItem("");
  };

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <Card className="p-6 border-2 flex flex-col max-h-[520px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-corpo-light rounded-sm border-2">
          <User className="h-5 w-5 text-corpo" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Looksmaxxing Tracker</h3>
          <p className="text-xs text-muted-foreground">
            Ottimizzazione estetica e mindset · {completedCount}/{items.length} completati
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nuovo obiettivo..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          className="border-2"
        />
        <Button
          size="icon"
          variant={newPriority === "alta" ? "default" : "outline"}
          onClick={() => setNewPriority(newPriority === "alta" ? "normale" : "alta")}
          className="shrink-0 border-2"
        >
          !
        </Button>
        <Select value={newCategory} onValueChange={(value) => setNewCategory(value as LooksmaxingCategory)}>
          <SelectTrigger className="border-2 w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addItem} size="icon" className="shrink-0 border-2">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 overflow-y-auto pr-2 flex-1 tracker-scroll">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 border-2 rounded-sm bg-muted/30"
          >
            <Checkbox checked={item.completed} onCheckedChange={() => toggleItem(item.id)} />
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium ${
                  item.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.title}
              </p>
              <div className="flex gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs uppercase border-2",
                    categoryMap[item.category].badgeClass,
                  )}
                >
                  {categoryMap[item.category].label}
                </Badge>
                {item.priority === "alta" && (
                  <Badge variant="outline" className="text-xs border-2">
                    PRIORITÀ
                  </Badge>
                )}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteItem(item.id)}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
