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
import { useState, useMemo } from "react";
import { useExperienceService, type ExperienceEntry, type ExperienceCategory } from "@/lib/experienceService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

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
  const { experiences, loading, addExperience, deleteExperience } = useExperienceService();
  const [newExperience, setNewExperience] = useState({
    title: "",
    category: "natura" as ExperienceCategory,
    date: "Oggi",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setNewExperience({ title: "", category: "natura", date: "Oggi", description: "" });
  };

  const handleAddExperience = async () => {
    if (!newExperience.title.trim() || !newExperience.description.trim()) {
      return;
    }

    setSubmitting(true);
    const success = await addExperience(
      newExperience.title.trim(),
      newExperience.category,
      newExperience.date.trim() || "Oggi",
      newExperience.description.trim(),
    );
    setSubmitting(false);

    if (success) {
      resetForm();
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (submitting || deletingId) return;
    setDeletingId(id);
    const success = await deleteExperience(id);
    if (success) {
      if (detailId === id) {
        setDetailId(null);
      }
    }
    setDeletingId(null);
  };

  const selectedExperience = useMemo(
    () => experiences.find((exp) => exp.id === detailId) ?? null,
    [detailId, experiences],
  );

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
              setNewExperience((prev) => ({ ...prev, category: value as ExperienceCategory }))
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
          <Button
            onClick={handleAddExperience}
            className="border-2"
            disabled={submitting || loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Aggiungi esperienza
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <Card className="p-4 border-dashed text-sm text-muted-foreground">
            Caricamento esperienze...
          </Card>
        ) : experiences.length === 0 ? (
          <Card className="p-4 border-dashed text-sm text-muted-foreground">
            Nessuna esperienza registrata. Aggiungi la tua prima esperienza!
          </Card>
        ) : (
          experiences.map((exp: ExperienceEntry) => {
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
                        {exp.dateLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {exp.description}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="text-xs border-2 border-mente/40 bg-mente/20 text-mente">
                        {categoryLabels[exp.category]}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-2" onClick={() => setDetailId(exp.id)}>
                          Dettagli
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="border-2"
                          disabled={deletingId === exp.id}
                          onClick={() => handleDeleteExperience(exp.id)}
                        >
                          {deletingId === exp.id ? "Eliminazione..." : "Elimina"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!selectedExperience} onOpenChange={(open) => (!open ? setDetailId(null) : undefined)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedExperience?.title}</DialogTitle>
            <DialogDescription>
              {selectedExperience?.createdAt
                ? `Registrata il ${format(new Date(selectedExperience.createdAt), "dd MMM yyyy")}`
                : "Dettagli esperienza"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {selectedExperience && (
                <>
                  <div className="flex items-center gap-3">
                    <Badge className="text-xs border-2 border-mente/40 bg-mente/20 text-mente">
                      {categoryLabels[selectedExperience.category]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedExperience.dateLabel}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {selectedExperience.description || "Nessuna descrizione disponibile."}
                  </p>
                </>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            {selectedExperience && (
              <Button
                variant="destructive"
                className="border-2"
                disabled={deletingId === selectedExperience.id}
                onClick={() => handleDeleteExperience(selectedExperience.id)}
              >
                {deletingId === selectedExperience.id ? "Eliminazione..." : "Elimina esperienza"}
              </Button>
            )}
            <Button variant="outline" className="border-2" onClick={() => setDetailId(null)}>
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
