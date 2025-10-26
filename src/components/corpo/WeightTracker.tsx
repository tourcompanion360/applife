import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { useWeightEntries, type WeightEntry } from "@/lib/weightService";

export const WeightTracker = () => {
  const { loadEntries, addEntry } = useWeightEntries();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newWeight, setNewWeight] = useState("");
  const [newBodyfat, setNewBodyfat] = useState("");
  const [newBelly, setNewBelly] = useState("");
  const [newPenis, setNewPenis] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await loadEntries();
      setEntries(data);
      setLoading(false);
    };
    fetchEntries();
  }, [loadEntries]);

  const handleAddEntry = async () => {
    if (!newWeight || submitting) return;

    setSubmitting(true);
    const success = await addEntry(
      parseFloat(newWeight),
      newBodyfat ? parseFloat(newBodyfat) : undefined,
      newBelly ? parseFloat(newBelly) : undefined,
      newPenis ? parseFloat(newPenis) : undefined
    );

    if (success) {
      const data = await loadEntries();
      setEntries(data);
      setNewWeight("");
      setNewBodyfat("");
      setNewBelly("");
      setNewPenis("");
    }

    setSubmitting(false);
  };

  const getWeightChange = () => {
    if (entries.length < 2) return 0;
    return entries[entries.length - 1].weight_kg - entries[0].weight_kg;
  };

  const weightChange = getWeightChange();

  return (
    <Card className="p-6 border-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-corpo-light rounded-sm border-2">
            <Scale className="h-5 w-5 text-corpo" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Peso & Composizione</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {entries.length > 0 && `Ultimo: ${entries[entries.length - 1].weight_kg}kg`}
            </p>
          </div>
        </div>
        {weightChange !== 0 && (
          <Badge variant={weightChange < 0 ? "default" : "secondary"} className="gap-1">
            {weightChange < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            {Math.abs(weightChange).toFixed(1)}kg
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {entries.slice(0, 5).map((entry, idx) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 bg-muted/30 border-2 rounded-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono w-20">{entry.measured_at}</span>
              <span className="font-bold font-mono">{entry.weight_kg}kg</span>
              {entry.bodyfat_pct && (
                <Badge variant="outline" className="text-xs border-2">
                  BF: {entry.bodyfat_pct}%
                </Badge>
              )}
              {entry.waist_cm && (
                <Badge variant="outline" className="text-xs border-2">
                  VITA: {entry.waist_cm}cm
                </Badge>
              )}
              {entry.penis_cm && (
                <Badge variant="outline" className="text-xs border-2">
                  PENIS: {entry.penis_cm}cm
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          type="number"
          step="0.1"
          placeholder="Peso (kg)"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          className="border-2"
        />
        <Input
          type="number"
          step="0.1"
          placeholder="BF% (opz)"
          value={newBodyfat}
          onChange={(e) => setNewBodyfat(e.target.value)}
          className="border-2"
        />
        <Input
          type="number"
          step="0.1"
          placeholder="Vita (cm)"
          value={newBelly}
          onChange={(e) => setNewBelly(e.target.value)}
          className="border-2"
        />
        <Input
          type="number"
          step="0.1"
          placeholder="Penis (cm)"
          value={newPenis}
          onChange={(e) => setNewPenis(e.target.value)}
          className="border-2"
        />
        <Button onClick={handleAddEntry} disabled={loading || submitting} className="border-2">
          Aggiungi
        </Button>
      </div>
    </Card>
  );
};
