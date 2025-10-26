import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { useLearningService, type LearningEntry, type ReflectionEntry } from "@/lib/learningService";

export const LearningTracker = () => {
  const { loadLearningEntries, loadReflectionEntries, addLearningEntry, addReflectionEntry } = useLearningService();

  const [learningEntries, setLearningEntries] = useState<LearningEntry[]>([]);
  const [reflectionEntries, setReflectionEntries] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Learning form
  const [skill, setSkill] = useState("");
  const [resourceType, setResourceType] = useState<string>("");
  const [resourceTitle, setResourceTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [insight, setInsight] = useState("");

  // Reflection form
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [learningData, reflectionData] = await Promise.all([
        loadLearningEntries(),
        loadReflectionEntries(),
      ]);
      setLearningEntries(learningData);
      setReflectionEntries(reflectionData);
      setLoading(false);
    };
    fetchData();
  }, [loadLearningEntries, loadReflectionEntries]);

  const handleSubmitLearning = async () => {
    if (!skill || !resourceType || submitting) return;
    setSubmitting(true);

    const success = await addLearningEntry(
      skill,
      resourceType,
      resourceTitle || undefined,
      durationMinutes ? parseInt(durationMinutes) : undefined,
      insight || undefined
    );

    if (success) {
      setSkill("");
      setResourceType("");
      setResourceTitle("");
      setDurationMinutes("");
      setInsight("");
      const data = await loadLearningEntries();
      setLearningEntries(data);
    }

    setSubmitting(false);
  };

  const handleSubmitReflection = async () => {
    if (!reflection || submitting) return;
    setSubmitting(true);

    const success = await addReflectionEntry(reflection);

    if (success) {
      setReflection("");
      const data = await loadReflectionEntries();
      setReflectionEntries(data);
    }

    setSubmitting(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Learning */}
      <Card className="p-6 border-2 bg-mente-light/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-sm border-2 bg-mente-light">
            <BookOpen className="h-5 w-5 text-mente" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Apprendimento</h3>
            <p className="text-xs text-muted-foreground font-mono">Skill / Risorse / Tempo</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Skill appresa (es. After Effects)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="border-2"
          />
          <Select value={resourceType} onValueChange={setResourceType}>
            <SelectTrigger className="border-2">
              <SelectValue placeholder="Tipo risorsa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
              <SelectItem value="doc">Documento</SelectItem>
              <SelectItem value="course">Corso</SelectItem>
              <SelectItem value="other">Altro</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Titolo risorsa (opzionale)"
            value={resourceTitle}
            onChange={(e) => setResourceTitle(e.target.value)}
            className="border-2"
          />
          <Input
            type="number"
            placeholder="Minuti dedicati"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="border-2"
          />
          <Textarea
            placeholder="Insight o lezione appresa..."
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            className="border-2 min-h-[60px]"
          />
          <Button onClick={handleSubmitLearning} disabled={loading || submitting} className="border-2 w-full">
            Log Apprendimento
          </Button>
        </div>
      </Card>

      {/* Reflection */}
      <Card className="p-6 border-2 bg-mente-light/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-sm border-2 bg-mente-light">
            <Lightbulb className="h-5 w-5 text-mente" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Riflessione Giornaliera</h3>
            <p className="text-xs text-muted-foreground font-mono">Win / Insight / Pensiero</p>
          </div>
        </div>

        {reflectionEntries.length > 0 && (
          <div className="mb-4 p-3 bg-muted/30 border-2 rounded-sm">
            <p className="text-sm font-mono mb-2">Oggi</p>
            <p className="text-sm">{reflectionEntries[0].insight}</p>
          </div>
        )}

        <div className="space-y-3">
          <Textarea
            placeholder="Scrivi la tua riflessione giornaliera..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="border-2 min-h-[120px]"
          />
          <Button onClick={handleSubmitReflection} disabled={loading || submitting} className="border-2 w-full">
            Salva Riflessione
          </Button>
        </div>
      </Card>
    </div>
  );
};
