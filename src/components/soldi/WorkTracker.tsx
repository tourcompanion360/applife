import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { useWorkService, type WorkEntry, type LeadEntry, type RevenueEntry } from "@/lib/workService";

export const WorkTracker = () => {
  const { loadWorkEntries, loadLeadEntries, loadRevenueEntries, addWorkEntry, addLeadEntry, addRevenueEntry } = useWorkService();

  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [leadEntries, setLeadEntries] = useState<LeadEntry[]>([]);
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Work form
  const [project, setProject] = useState("");
  const [client, setClient] = useState("");
  const [deepMinutes, setDeepMinutes] = useState("");
  const [shallowMinutes, setShallowMinutes] = useState("");
  const [workNotes, setWorkNotes] = useState("");

  // Lead form
  const [channel, setChannel] = useState<string>("");
  const [leadCount, setLeadCount] = useState("");
  const [leadProject, setLeadProject] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  // Revenue form
  const [weekStart, setWeekStart] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [revenueNotes, setRevenueNotes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [workData, leadData, revenueData] = await Promise.all([
        loadWorkEntries(),
        loadLeadEntries(),
        loadRevenueEntries(),
      ]);
      setWorkEntries(workData);
      setLeadEntries(leadData);
      setRevenueEntries(revenueData);
      setLoading(false);
    };
    fetchData();
  }, [loadWorkEntries, loadLeadEntries, loadRevenueEntries]);

  const handleSubmitWork = async () => {
    if (!project || submitting) return;
    setSubmitting(true);

    const success = await addWorkEntry(
      project,
      client || undefined,
      parseInt(deepMinutes) || 0,
      parseInt(shallowMinutes) || 0,
      workNotes || undefined
    );

    if (success) {
      setProject("");
      setClient("");
      setDeepMinutes("");
      setShallowMinutes("");
      setWorkNotes("");
      const data = await loadWorkEntries();
      setWorkEntries(data);
    }

    setSubmitting(false);
  };

  const handleSubmitLead = async () => {
    if (!channel || submitting) return;
    setSubmitting(true);

    const success = await addLeadEntry(
      channel,
      parseInt(leadCount) || 1,
      leadProject || undefined,
      leadNotes || undefined
    );

    if (success) {
      setChannel("");
      setLeadCount("");
      setLeadProject("");
      setLeadNotes("");
      const data = await loadLeadEntries();
      setLeadEntries(data);
    }

    setSubmitting(false);
  };

  const handleSubmitRevenue = async () => {
    if (!weekStart || !amount || submitting) return;
    setSubmitting(true);

    const success = await addRevenueEntry(
      weekStart,
      parseFloat(amount),
      source || undefined,
      revenueNotes || undefined
    );

    if (success) {
      setWeekStart("");
      setAmount("");
      setSource("");
      setRevenueNotes("");
      const data = await loadRevenueEntries();
      setRevenueEntries(data);
    }

    setSubmitting(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Work Hours */}
      <Card className="p-6 border-2 bg-soldi-light/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-sm border-2 bg-soldi-light">
            <Briefcase className="h-5 w-5 text-soldi" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Ore di Lavoro</h3>
            <p className="text-xs text-muted-foreground font-mono">Deep vs Shallow</p>
          </div>
        </div>

        <div className="space-y-3">
          <Select value={project} onValueChange={setProject}>
            <SelectTrigger className="border-2">
              <SelectValue placeholder="Progetto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tour Companion">Tour Companion</SelectItem>
              <SelectItem value="Prismatica360">Prismatica360</SelectItem>
              <SelectItem value="Trading">Trading</SelectItem>
              <SelectItem value="Altro">Altro</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Cliente (opzionale)"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="border-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Deep (min)"
              value={deepMinutes}
              onChange={(e) => setDeepMinutes(e.target.value)}
              className="border-2"
            />
            <Input
              type="number"
              placeholder="Shallow (min)"
              value={shallowMinutes}
              onChange={(e) => setShallowMinutes(e.target.value)}
              className="border-2"
            />
          </div>
          <Input
            placeholder="Note"
            value={workNotes}
            onChange={(e) => setWorkNotes(e.target.value)}
            className="border-2"
          />
          <Button onClick={handleSubmitWork} disabled={loading || submitting} className="border-2 w-full">
            Log Lavoro
          </Button>
        </div>
      </Card>

      {/* Leads */}
      <Card className="p-6 border-2 bg-soldi-light/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-sm border-2 bg-soldi-light">
            <Users className="h-5 w-5 text-soldi" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Lead Raggiunti</h3>
            <p className="text-xs text-muted-foreground font-mono">Email / Chiamate / Incontro</p>
          </div>
        </div>

        <div className="space-y-3">
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="border-2">
              <SelectValue placeholder="Canale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="call">Chiamata</SelectItem>
              <SelectItem value="in_person">Incontro</SelectItem>
              <SelectItem value="other">Altro</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Conteggio (default 1)"
            value={leadCount}
            onChange={(e) => setLeadCount(e.target.value)}
            className="border-2"
          />
          <Input
            placeholder="Progetto"
            value={leadProject}
            onChange={(e) => setLeadProject(e.target.value)}
            className="border-2"
          />
          <Input
            placeholder="Note"
            value={leadNotes}
            onChange={(e) => setLeadNotes(e.target.value)}
            className="border-2"
          />
          <Button onClick={handleSubmitLead} disabled={loading || submitting} className="border-2 w-full">
            Log Lead
          </Button>
        </div>
      </Card>

      {/* Revenue */}
      <Card className="p-6 border-2 bg-soldi-light/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-sm border-2 bg-soldi-light">
            <DollarSign className="h-5 w-5 text-soldi" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Entrate Settimanali</h3>
            <p className="text-xs text-muted-foreground font-mono">Ricavi guadagnati</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            type="date"
            placeholder="Inizio settimana"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="border-2"
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Importo (€)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-2"
          />
          <Input
            placeholder="Fonte"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border-2"
          />
          <Input
            placeholder="Note"
            value={revenueNotes}
            onChange={(e) => setRevenueNotes(e.target.value)}
            className="border-2"
          />
          <Button onClick={handleSubmitRevenue} disabled={loading || submitting} className="border-2 w-full">
            Log Entrate
          </Button>
        </div>
      </Card>
    </div>
  );
};
