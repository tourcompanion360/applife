import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FocusTimer } from "@/components/business/FocusTimer";
import { formatFocusDuration } from "@/components/business/FocusTimer";
import { useFocusTimer } from "@/contexts/FocusTimerContext";
import { format } from "date-fns";
import { createPortal } from "react-dom";

export const FocusSection = () => {
  const {
    sessions,
    loading,
    createSession,
    updateSession,
    deleteSession,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    computeSessionElapsed,
    startTimer,
    pauseTimer,
    completeTimer,
    resetTimer,
  } = useFocusTimer();

  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [plannedMinutes, setPlannedMinutes] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId],
  );
  const elapsedSeconds = selectedSession ? computeSessionElapsed(selectedSession) : 0;

  useEffect(() => {
    if (!fullscreenVisible) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreenVisible]);

  const handleCreateSession = async () => {
    if (!title.trim()) return;
    const session = await createSession(title.trim(), goal.trim() || undefined, plannedMinutes ? parseInt(plannedMinutes, 10) : undefined);
    if (session) {
      setTitle("");
      setGoal("");
      setPlannedMinutes("");
      setSelectedSessionId(session.id);
    }
  };

  const handleAddTask = async () => {
    if (!selectedSessionId || !newTaskTitle.trim()) return;
    await addTask(selectedSessionId, newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await toggleTaskCompletion(taskId, completed);
  };

  const handleTimerStart = () => {
    if (!selectedSession) return;
    void startTimer(selectedSession.id);
  };

  const handleTimerPause = () => {
    if (!selectedSession) return;
    void pauseTimer(selectedSession.id);
  };

  const handleTimerComplete = () => {
    if (!selectedSession) return;
    void completeTimer(selectedSession.id);
  };

  const handleTimerReset = () => {
    if (!selectedSession) return;
    void resetTimer(selectedSession.id);
  };

  const handleNotesChange = (notes: string) => {
    if (!selectedSession) return;
    void updateSession(selectedSession.id, { notes });
  };

  return (
    <>
      <Card className="border-2 p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Focus Planner & Timer</h3>
            <p className="text-xs text-muted-foreground font-mono">Organizza una giornata di deep work con timer e risultati.</p>
          </div>
          <Button variant="outline" className="border-2" disabled={!selectedSession} onClick={handleTimerStart}>
            Avvia sessione
          </Button>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <div className="space-y-2">
              <Input
                placeholder="Titolo sessione (es. Outreach clienti)"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="border-2"
              />
              <Textarea
                placeholder="Obiettivo (es. trovare 5 lead caldi, costruire MVP, ecc.)"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className="border-2"
              />
              <Input
                type="number"
                placeholder="Minuti pianificati"
                value={plannedMinutes}
                onChange={(event) => setPlannedMinutes(event.target.value)}
                className="border-2"
              />
              <Button onClick={handleCreateSession} className="border-2 w-full" disabled={loading}>
                Crea sessione focus
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Sessioni recenti</h4>
              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nessuna sessione registrata.</p>
                  ) : (
                    sessions.map((session) => (
                      <Card
                        key={session.id}
                        className={`p-3 border-2 cursor-pointer transition ${selectedSessionId === session.id ? "border-soldi" : "border-muted"}`}
                        onClick={() => setSelectedSessionId(session.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold line-clamp-1">{session.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.sessionDate), "dd MMM")} • {session.status === "completed" ? "Completata" : session.status === "in_progress" ? "In corso" : "Pianificata"}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {session.status === "completed" && <Badge className="text-[10px] border-2 bg-green-500/10 text-green-500">Done</Badge>}
                            {session.plannedMinutes ? (
                              <Badge variant="outline" className="text-[10px]">
                                {session.plannedMinutes}m
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="border-2 rounded-md p-4 space-y-4">
            {selectedSession ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold">{selectedSession.title}</h4>
                    {selectedSession.goal && <p className="text-sm text-muted-foreground">🎯 {selectedSession.goal}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" className="border-2" onClick={() => deleteSession(selectedSession.id)}>
                      Elimina sessione
                    </Button>
                  </div>
                </div>

                <FocusTimer
                  sessionTitle={selectedSession.title}
                  elapsedSeconds={elapsedSeconds}
                  isRunning={selectedSession.isRunning}
                  plannedMinutes={selectedSession.plannedMinutes ?? undefined}
                  onStart={handleTimerStart}
                  onPause={handleTimerPause}
                  onReset={handleTimerReset}
                  onComplete={handleTimerComplete}
                  onToggleFullscreen={() => setFullscreenVisible(true)}
                />

                <div className="space-y-3">
                  <h5 className="text-sm font-semibold">Task focus</h5>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nuovo task (es. contattare 5 lead)"
                      value={newTaskTitle}
                      onChange={(event) => setNewTaskTitle(event.target.value)}
                      className="border-2"
                    />
                    <Button onClick={handleAddTask} className="border-2" disabled={!newTaskTitle.trim()}>
                      Aggiungi
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedSession.tasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nessun task ancora. Aggiungi attività chiave della sessione.</p>
                    ) : (
                      selectedSession.tasks.map((task) => (
                        <Card key={task.id} className="p-3 border-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={(checked) => handleToggleTask(task.id, Boolean(checked))}
                                className="border-2"
                              />
                              <div>
                                <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {task.title}
                                </p>
                                {task.metricLabel && (
                                  <p className="text-xs text-muted-foreground">
                                    {task.metricLabel}: {task.resultValue ?? 0}/{task.targetValue ?? 0}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" className="text-xs" onClick={() => deleteTask(task.id)}>
                              Rimuovi
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Card className="p-3 border-2 bg-muted/20">
                    <p className="text-xs text-muted-foreground font-mono">Tempo pianificato</p>
                    <p className="text-lg font-semibold">{selectedSession.plannedMinutes ?? "—"} min</p>
                  </Card>
                  <Card className="p-3 border-2 bg-muted/20">
                    <p className="text-xs text-muted-foreground font-mono">Tempo effettivo</p>
                    <p className="text-lg font-semibold">{selectedSession.actualMinutes ?? Math.round(elapsedSeconds / 60) ?? "—"} min</p>
                  </Card>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Note finali</label>
                  <Textarea
                    value={selectedSession.notes ?? ""}
                    onChange={(event) => handleNotesChange(event.target.value)}
                    placeholder="Annota risultati, follow-up o riflessioni"
                    className="border-2 min-h-[120px]"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground">
                Seleziona o crea una sessione focus per iniziare a pianificare la giornata di deep work.
              </div>
            )}
          </div>
        </div>
      </Card>

      {fullscreenVisible && selectedSession
        ? createPortal(
            <div className="fixed inset-0 z-50 bg-black text-white">
              <button
                type="button"
                className="absolute top-6 right-6 text-3xl leading-none font-light text-white/70 hover:text-white"
                aria-label="Chiudi timer a schermo intero"
                onClick={() => setFullscreenVisible(false)}
              >
                ×
              </button>
              <div className="h-full w-full flex items-center justify-center">
                <span className="font-mono tracking-[1rem] text-[min(20vw,12rem)]">
                  {formatFocusDuration(elapsedSeconds)}
                </span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
