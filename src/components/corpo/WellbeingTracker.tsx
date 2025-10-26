import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Moon, TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useWellbeingService, type WellbeingEntry, type SleepEntry } from "@/lib/wellbeingService";

export const WellbeingTracker = () => {
  const { loadWellbeingEntries, loadSleepEntries, addWellbeingEntry, addSleepEntry } = useWellbeingService();

  const [wellbeingEntries, setWellbeingEntries] = useState<WellbeingEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Wellbeing form
  const [moodMorning, setMoodMorning] = useState<string>("");
  const [moodEvening, setMoodEvening] = useState<string>("");
  const [energyMorning, setEnergyMorning] = useState<string>("");
  const [energyEvening, setEnergyEvening] = useState<string>("");
  const [momentum, setMomentum] = useState<string>("");
  const [reflection, setReflection] = useState("");

  // Sleep form
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [sleepNotes, setSleepNotes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [wellbeingData, sleepData] = await Promise.all([
        loadWellbeingEntries(),
        loadSleepEntries(),
      ]);
      setWellbeingEntries(wellbeingData);
      setSleepEntries(sleepData);
      setLoading(false);
    };
    fetchData();
  }, [loadWellbeingEntries, loadSleepEntries]);

  const handleSubmitWellbeing = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const success = await addWellbeingEntry(
      moodMorning ? parseInt(moodMorning) : undefined,
      moodEvening ? parseInt(moodEvening) : undefined,
      energyMorning ? parseInt(energyMorning) : undefined,
      energyEvening ? parseInt(energyEvening) : undefined,
      momentum ? parseInt(momentum) : undefined,
      reflection || undefined
    );

    if (success) {
      setMoodMorning("");
      setMoodEvening("");
      setEnergyMorning("");
      setEnergyEvening("");
      setMomentum("");
      setReflection("");
      const data = await loadWellbeingEntries();
      setWellbeingEntries(data);
    }

    setSubmitting(false);
  }, [submitting, addWellbeingEntry, moodMorning, moodEvening, energyMorning, energyEvening, momentum, reflection, loadWellbeingEntries]);

  const handleSubmitSleep = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    // Calculate duration if both times provided
    let duration: number | undefined;
    if (bedtime && wakeTime) {
      const bed = new Date(`1970-01-01T${bedtime}:00`);
      let wake = new Date(`1970-01-01T${wakeTime}:00`);
      if (wake < bed) wake.setDate(wake.getDate() + 1); // Next day
      duration = Math.round((wake.getTime() - bed.getTime()) / (1000 * 60));
    }

    const success = await addSleepEntry(
      bedtime || undefined,
      wakeTime || undefined,
      duration,
      sleepQuality ? parseInt(sleepQuality) : undefined,
      sleepNotes || undefined
    );

    if (success) {
      setBedtime("");
      setWakeTime("");
      setSleepQuality("");
      setSleepNotes("");
      const data = await loadSleepEntries();
      setSleepEntries(data);
    }

    setSubmitting(false);
  }, [submitting, addSleepEntry, bedtime, wakeTime, sleepQuality, sleepNotes, loadSleepEntries]);

  const today = new Date().toISOString().split("T")[0];
  const todayWellbeing = wellbeingEntries.find(e => e.log_date === today);
  const todaySleep = sleepEntries.find(e => e.log_date === today);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Wellbeing Card */}
      <Card className="p-6 border-2 bg-corpo-light/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-sm border-2 bg-corpo-light">
            <Heart className="h-5 w-5 text-corpo" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Benessere Giornaliero</h3>
            <p className="text-xs text-muted-foreground font-mono">Umore, energia, momentum</p>
          </div>
        </div>

        {todayWellbeing && (
          <div className="mb-4 p-3 bg-muted/30 border-2 rounded-sm">
            <p className="text-sm font-mono mb-2">Oggi</p>
            <div className="flex flex-wrap gap-2">
              {todayWellbeing.mood_morning && (
                <Badge variant="outline" className="text-xs">Umore matt.: {todayWellbeing.mood_morning}/10</Badge>
              )}
              {todayWellbeing.mood_evening && (
                <Badge variant="outline" className="text-xs">Umore sera: {todayWellbeing.mood_evening}/10</Badge>
              )}
              {todayWellbeing.energy_morning && (
                <Badge variant="outline" className="text-xs">Energia matt.: {todayWellbeing.energy_morning}/10</Badge>
              )}
              {todayWellbeing.energy_evening && (
                <Badge variant="outline" className="text-xs">Energia sera: {todayWellbeing.energy_evening}/10</Badge>
              )}
              {todayWellbeing.momentum && (
                <Badge variant="outline" className="text-xs">Momentum: {todayWellbeing.momentum}/10</Badge>
              )}
            </div>
            {todayWellbeing.reflection && (
              <p className="text-xs text-muted-foreground mt-2">{todayWellbeing.reflection}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Select value={moodMorning} onValueChange={setMoodMorning}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Umore mattina" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={moodEvening} onValueChange={setMoodEvening}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Umore sera" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={energyMorning} onValueChange={setEnergyMorning}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Energia mattina" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={energyEvening} onValueChange={setEnergyEvening}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Energia sera" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={momentum} onValueChange={setMomentum}>
            <SelectTrigger className="border-2">
              <SelectValue placeholder="Momentum (1-10)" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Riflessione giornaliera..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="border-2 min-h-[60px]"
          />
          <Button onClick={handleSubmitWellbeing} disabled={loading || submitting} className="border-2 w-full">
            Salva Benessere
          </Button>
        </div>
      </Card>

      {/* Sleep Card */}
      <Card className="p-6 border-2 bg-corpo-light/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-sm border-2 bg-corpo-light">
            <Moon className="h-5 w-5 text-corpo" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Sonno</h3>
            <p className="text-xs text-muted-foreground font-mono">Ore di sonno e qualità</p>
          </div>
        </div>

        {todaySleep && (
          <div className="mb-4 p-3 bg-muted/30 border-2 rounded-sm">
            <p className="text-sm font-mono mb-2">Oggi</p>
            <div className="flex flex-wrap gap-2">
              {todaySleep.bedtime && (
                <Badge variant="outline" className="text-xs">Letto: {todaySleep.bedtime}</Badge>
              )}
              {todaySleep.wake_time && (
                <Badge variant="outline" className="text-xs">Sveglia: {todaySleep.wake_time}</Badge>
              )}
              {todaySleep.duration_minutes && (
                <Badge variant="outline" className="text-xs">Durata: {Math.floor(todaySleep.duration_minutes / 60)}h {todaySleep.duration_minutes % 60}m</Badge>
              )}
              {todaySleep.quality && (
                <Badge variant="outline" className="text-xs">Qualità: {todaySleep.quality}/10</Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="time"
              placeholder="Ora di andare a letto"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="border-2"
            />
            <Input
              type="time"
              placeholder="Ora di svegliarsi"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="border-2"
            />
          </div>
          <Select value={sleepQuality} onValueChange={setSleepQuality}>
            <SelectTrigger className="border-2">
              <SelectValue placeholder="Qualità del sonno (1-10)" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Note sul sonno..."
            value={sleepNotes}
            onChange={(e) => setSleepNotes(e.target.value)}
            className="border-2 min-h-[60px]"
          />
          <Button onClick={handleSubmitSleep} disabled={loading || submitting} className="border-2 w-full">
            Salva Sonno
          </Button>
        </div>
      </Card>
    </div>
  );
};
