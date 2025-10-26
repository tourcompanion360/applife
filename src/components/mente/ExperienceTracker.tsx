import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Mountain, Book, Cpu } from "lucide-react";
import { useState } from "react";

interface Experience {
  id: string;
  title: string;
  category: "natura" | "hobby" | "lettura" | "progetti";
  date: string;
  description: string;
}

const categoryIcons = {
  natura: Mountain,
  hobby: Sparkles,
  lettura: Book,
  progetti: Cpu,
};

const categoryLabels = {
  natura: "Natura & Esperienze",
  hobby: "Hobby",
  lettura: "Lettura & Studio",
  progetti: "Side Projects",
};

export const ExperienceTracker = () => {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      title: "Passeggiata al parco",
      category: "natura",
      date: "Oggi",
      description: "1h di connessione con la natura",
    },
    {
      id: "2",
      title: "Progetto Drone FPV",
      category: "progetti",
      date: "In corso",
      description: "Costruzione drone con vecchi componenti",
    },
    {
      id: "3",
      title: "Lettura libro mindset",
      category: "lettura",
      date: "Ieri",
      description: "30 pagine sul mindset imprenditoriale",
    },
  ]);

  const [newExperience, setNewExperience] = useState({
    title: "",
    category: "natura" as Experience["category"],
    date: "Oggi",
    description: "",
  });

  const resetForm = () => {
    setNewExperience({ title: "", category: "natura", date: "Oggi", description: "" });
  };

  const handleAddExperience = () => {
    if (!newExperience.title.trim() || !newExperience.description.trim()) {
      return;
    }

    setExperiences((prev) => [
      {
        id: Date.now().toString(),
        title: newExperience.title.trim(),
        category: newExperience.category,
        date: newExperience.date.trim() || "Oggi",
        description: newExperience.description.trim(),
      },
      ...prev,
    ]);

    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Le tue esperienze</h3>
      </div>

      <Card className="p-4 border-2 bg-muted/20 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Titolo esperienza"
            value={newExperience.title}
            onChange={(event) => setNewExperience((prev) => ({ ...prev, title: event.target.value }))}
            className="border-2"
          />
          <Input
            placeholder="Data / stato"
            value={newExperience.date}
            onChange={(event) => setNewExperience((prev) => ({ ...prev, date: event.target.value }))}
            className="border-2"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-[200px_1fr]">
          <Select
            value={newExperience.category}
            onValueChange={(value) =>
              setNewExperience((prev) => ({ ...prev, category: value as Experience["category"] }))
            }
          >
            <SelectTrigger className="border-2">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natura">Natura & Esperienze</SelectItem>
              <SelectItem value="hobby">Hobby</SelectItem>
              <SelectItem value="lettura">Lettura & Studio</SelectItem>
              <SelectItem value="progetti">Side Projects</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Descrizione"
            value={newExperience.description}
            onChange={(event) =>
              setNewExperience((prev) => ({ ...prev, description: event.target.value }))
            }
            className="border-2"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={resetForm} className="border-2">
            Reset
          </Button>
          <Button onClick={handleAddExperience} className="border-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Aggiungi esperienza
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {experiences.map((exp) => {
          const Icon = categoryIcons[exp.category];
          return (
            <Card key={exp.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-mente-light shrink-0">
                  <Icon className="h-5 w-5 text-mente" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {exp.date}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {exp.description}
                  </p>
                  <Badge className="text-xs border-2 border-mente/40 bg-mente/20 text-mente">
                    {categoryLabels[exp.category]}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-gradient-mente text-white">
        <h4 className="font-semibold mb-2">💡 Suggerimento</h4>
        <p className="text-sm text-white/90">
          Prova a fare almeno un'esperienza nuova a settimana: una passeggiata in un posto nuovo, 
          imparare qualcosa di hardware, o dedicare tempo a un hobby creativo.
        </p>
      </Card>
    </div>
  );
};
