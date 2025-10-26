import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { TaskList } from "@/components/soldi/TaskList";
import type { Task } from "@/components/soldi/TaskList";
import { MoneyTracker } from "@/components/soldi/MoneyTracker";
import type { MoneyTransaction } from "@/components/soldi/MoneyTracker";
import { WorkTracker } from "@/components/soldi/WorkTracker";
import { useTransactionService, type Transaction } from "@/lib/transactionService";
import { WorkoutTracker } from "@/components/corpo/WorkoutTracker";
import { WeightTracker } from "@/components/corpo/WeightTracker";
import { LooksmaxingTracker } from "@/components/corpo/LooksmaxingTracker";
import { MasturbationStreak } from "@/components/corpo/MasturbationStreak";
import { StepsTracker } from "@/components/corpo/StepsTracker";
import type { StepsSummary } from "@/components/corpo/StepsTracker";
import { WellbeingTracker } from "@/components/corpo/WellbeingTracker";
import { ExperienceTracker } from "@/components/mente/ExperienceTracker";
import { LearningTracker } from "@/components/mente/LearningTracker";
import { Badge } from "@/components/ui/badge";
import { useTourTasksService, type TourPhase } from "@/lib/tourTasksService";
import { useBusinessTasksService, type BusinessArea } from "@/lib/businessTasksService";
import { DollarSign, Brain, Heart, TrendingUp, Target, CheckSquare, Sparkles, Dumbbell, BarChart3, RefreshCcw } from "lucide-react";

const TOUR_PHASES: TourPhase[] = ["Development", "Costruzione", "Marketing", "Testing"];
const BUSINESS_AREAS: BusinessArea[] = ["Business", "Mente", "Corpo", "Generale"];

const computeAggregateProgress = (taskList: Task[]) =>
  taskList.reduce(
    (acc, task) => {
      const subtasks = task.subtasks || [];
      const completedSubtasks = subtasks.filter((st) => st.completed).length;
      return {
        total: acc.total + 1 + subtasks.length,
        completed: acc.completed + (task.completed ? 1 : 0) + completedSubtasks,
      };
    },
    { total: 0, completed: 0 },
  );

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tourCompanionPhases, setTourCompanionPhases] = useState<string[]>(["Development"]);
  const {
    tasksByPhase: tourTasks,
    addTask: addTourTask,
    toggleTaskCompletion: toggleTourTaskCompletion,
    deleteTask: deleteTourTask,
    addSubtask: addTourSubtask,
    toggleSubtaskCompletion: toggleTourSubtaskCompletion,
    deleteSubtask: deleteTourSubtask,
  } = useTourTasksService();
  const {
    tasks: businessTasks,
    addTask: addBusinessTask,
    toggleTaskCompletion: toggleBusinessTaskCompletion,
    deleteTask: deleteBusinessTask,
    addSubtask: addBusinessSubtask,
    toggleSubtaskCompletion: toggleBusinessSubtaskCompletion,
    deleteSubtask: deleteBusinessSubtask,
  } = useBusinessTasksService();

  const [statsOpen, setStatsOpen] = useState(false);
  const [moneyTransactions, setMoneyTransactions] = useState<MoneyTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const { loadTransactions, addTransaction: dbAddTransaction, removeTransaction: dbRemoveTransaction } = useTransactionService();

  const mapTransactions = useCallback((data: Transaction[]) =>
    data.map((tx) => ({
      id: tx.id,
      description: tx.description || "",
      amount: tx.amount,
      type: tx.type,
      category: tx.category || "",
    })),
  []);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await loadTransactions();
      const converted = mapTransactions(data);
      setMoneyTransactions(converted);
      setLoadingTransactions(false);
    };
    fetchTransactions();
  }, [loadTransactions, mapTransactions]);

  const handleAddTransaction = async (transaction: Omit<MoneyTransaction, "id">) => {
    const success = await dbAddTransaction(
      new Date().toISOString().split('T')[0],
      transaction.type,
      transaction.amount,
      transaction.category,
      transaction.description
    );

    if (success) {
      const data = await loadTransactions();
      const converted = mapTransactions(data);
      setMoneyTransactions(converted);
    }
  };

  const handleRemoveTransaction = async (id: string) => {
    const success = await dbRemoveTransaction(id);
    if (success) {
      setMoneyTransactions((prev) => prev.filter((tx) => tx.id !== id));
    }
  };

  const handleRefreshTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const data = await loadTransactions();
      const converted = mapTransactions(data);
      setMoneyTransactions(converted);
    } finally {
      setLoadingTransactions(false);
    }
  }, [loadTransactions, mapTransactions]);

  const [streakDays, setStreakDays] = useState(0);
  const [stepsSummary, setStepsSummary] = useState<StepsSummary | null>(null);

  const handleStepsSummaryChange = useCallback((summary: StepsSummary) => {
    setStepsSummary((prev) => {
      if (
        prev &&
        prev.weeklyCompleted === summary.weeklyCompleted &&
        prev.weeklyGoal === summary.weeklyGoal &&
        prev.monthlyCompleted === summary.monthlyCompleted &&
        prev.monthlyGoal === summary.monthlyGoal &&
        prev.streak === summary.streak &&
        prev.lastSuccess === summary.lastSuccess
      ) {
        return prev;
      }
      return summary;
    });
  }, []);

  useEffect(() => {
    if (stepsSummary) {
      setStreakDays(stepsSummary.streak);
    }
  }, [stepsSummary]);

  const taskAggregate = computeAggregateProgress(businessTasks);

  const highPriorityTasks = businessTasks.filter((task) => task.priority === "alta" && !task.completed).length;
  const activeTasks = businessTasks.filter((task) => !task.completed).length;
  const completedTasks = businessTasks.filter((task) => task.completed).length;
  const completionRate = taskAggregate.total ? Math.round((taskAggregate.completed / taskAggregate.total) * 100) : 0;
  const focusCategories = BUSINESS_AREAS;

  const totalTourTasks = useMemo(
    () => Object.values(tourTasks).reduce((acc, list) => acc + list.length, 0),
    [tourTasks],
  );
  const totalBusinessTasks = businessTasks.length;
  const totalTasksCount = totalTourTasks + totalBusinessTasks;

  const togglePhase = (phase: string) => {
    setTourCompanionPhases((prev) => {
      if (prev.includes(phase)) {
        return prev.filter((item) => item !== phase);
      }
      return [...prev, phase];
    });
  };

  const highPriorityTourTasks = useMemo(
    () =>
      Object.entries(tourTasks)
        .flatMap(([phase, list]) =>
          list
            .filter((task) => task.priority === "alta" && !task.completed)
            .map((task) => ({ ...task, area: `Tour Companion / ${phase}` }))
        ),
    [tourTasks],
  );

  const highPriorityBusinessTasks = useMemo(
    () =>
      businessTasks
        .filter((task) => task.priority === "alta" && !task.completed)
        .map((task) => ({ ...task, area: task.category || "Business" })),
    [businessTasks],
  );

  const priorityTasks = useMemo(
    () => [...highPriorityTourTasks, ...highPriorityBusinessTasks],
    [highPriorityTourTasks, highPriorityBusinessTasks],
  );

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <header className="border-b-2 bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">MAYA</h1>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-2">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    STATS
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border-2">
                  <DialogHeader>
                    <DialogTitle>Panoramica giornaliera</DialogTitle>
                    <DialogDescription>
                      Tutti i progressi di oggi tra Tour Companion, trading, finanze e crescita personale.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                        <span>Completamento quotidiano</span>
                        <span>{`${taskAggregate.completed}/${taskAggregate.total}`}</span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {completionRate}% delle attività pianificate sono complete.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Card className="border-2 bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Task completati</p>
                        <p className="text-2xl font-semibold">{completedTasks}</p>
                      </Card>
                      <Card className="border-2 bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Priorità da chiudere</p>
                        <p className="text-2xl font-semibold">{highPriorityTasks}</p>
                        <p className="text-xs text-muted-foreground mt-1">Task ad alta priorità ancora aperti.</p>
                      </Card>
                    </div>

                    <Card className="border-2 bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Fasi Tour Companion</p>
                      <p className="font-semibold mt-1">
                        {tourCompanionPhases.length > 0 ? tourCompanionPhases.join(" / ") : "Nessuna fase attivata"}
                      </p>
                    </Card>

                    <div className="space-y-3">
                      {stepsSummary && (
                        <Card className="border-2 bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Attività fisica</span>
                            <span className="text-xs font-mono text-muted-foreground">No Fap Streak: {streakDays} giorni</span>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                                <span>Passi settimana</span>
                                <span>{`${stepsSummary.weeklyCompleted}/${stepsSummary.weeklyGoal}`}</span>
                              </div>
                              <Progress
                                value={Math.min((stepsSummary.weeklyCompleted / stepsSummary.weeklyGoal) * 100, 100)}
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                                <span>Passi mese</span>
                                <span>{`${stepsSummary.monthlyCompleted}/${stepsSummary.monthlyGoal}`}</span>
                              </div>
                              <Progress
                                value={Math.min((stepsSummary.monthlyCompleted / stepsSummary.monthlyGoal) * 100, 100)}
                                className="h-2"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Ultimo completamento passi: {stepsSummary.lastSuccess ?? "—"}
                          </p>
                        </Card>
                      )}
                      <p className="text-sm font-semibold">Aree chiave</p>
                      <div className="space-y-3">
                        {focusCategories.map((category) => {
                          const categoryTasks = businessTasks.filter((task) => task.category === category);
                          const categoryAggregate = computeAggregateProgress(categoryTasks);
                          const percent = categoryAggregate.total
                            ? Math.round((categoryAggregate.completed / categoryAggregate.total) * 100)
                            : 0;

                          return (
                            <Card key={category} className="border-2 bg-muted/20 p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{category}</span>
                                <span className="text-xs font-mono text-muted-foreground">
                                  {`${categoryAggregate.completed}/${categoryAggregate.total}`}
                                </span>
                              </div>
                              <Progress value={percent} className="h-1.5" />
                              <p className="text-xs text-muted-foreground">{percent}% completato</p>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-4 gap-2 w-[calc(100%-2rem)] max-w-md mx-auto border border-border/70 rounded-full bg-card/95 backdrop-blur fixed bottom-6 left-1/2 -translate-x-1/2 shadow-lg z-40 px-4 py-2 h-auto sm:max-w-lg md:max-w-xl lg:hidden">
              <TabsTrigger value="dashboard" className="flex flex-col items-center justify-center gap-1 px-0 py-1.5 text-xs h-full w-full">
                <BarChart3 className="h-4 w-4" />
                DASH
              </TabsTrigger>
              <TabsTrigger value="tour" className="flex flex-col items-center justify-center gap-1 px-0 py-1.5 text-xs h-full w-full">
                <Target className="h-4 w-4" />
                TOUR
              </TabsTrigger>
              <TabsTrigger value="business" className="flex flex-col items-center justify-center gap-1 px-0 py-1.5 text-xs h-full w-full">
                <DollarSign className="h-4 w-4" />
                BIZ
              </TabsTrigger>
              <TabsTrigger value="mente" className="flex flex-col items-center justify-center gap-1 px-0 py-1.5 text-xs h-full w-full">
                <Brain className="h-4 w-4" />
                MENTE
              </TabsTrigger>
              <TabsTrigger value="corpo" className="flex flex-col items-center justify-center gap-1 px-0 py-1.5 text-xs h-full w-full">
                <Dumbbell className="h-4 w-4" />
                CORPO
              </TabsTrigger>
            </TabsList>

            <TabsList className="hidden lg:inline-flex items-center gap-2 border-b-2 border-border/60 bg-transparent px-0 py-0">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-3 text-sm">
                <BarChart3 className="h-4 w-4" />
                DASH
              </TabsTrigger>
              <TabsTrigger value="tour" className="flex items-center gap-2 px-4 py-3 text-sm">
                <Target className="h-4 w-4" />
                TOUR
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2 px-4 py-3 text-sm">
                <DollarSign className="h-4 w-4" />
                BIZ
              </TabsTrigger>
              <TabsTrigger value="mente" className="flex items-center gap-2 px-4 py-3 text-sm">
                <Brain className="h-4 w-4" />
                MENTE
              </TabsTrigger>
              <TabsTrigger value="corpo" className="flex items-center gap-2 px-4 py-3 text-sm">
                <Dumbbell className="h-4 w-4" />
                CORPO
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Overview */}
            <TabsContent value="dashboard" className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Task Completati"
                  value={`${taskAggregate.completed}/${taskAggregate.total}`}
                  subtitle="Stato attuale"
                  icon={CheckSquare}
                  variant="soldi"
                />
                <StatCard title="Esperienze" value="0" subtitle="Questo mese" icon={Sparkles} variant="mente" />
                <StatCard title="Allenamenti" value="0" subtitle="Questa settimana" icon={Dumbbell} variant="corpo" />
              </div>

              <Card className="border-2 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Task prioritari oggi</h3>
                  <Badge variant="outline" className="border-2 text-xs">
                    {priorityTasks.length}
                  </Badge>
                </div>
                {priorityTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nessuna task ad alta priorità aperta. Continua così!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {priorityTasks.slice(0, 6).map((task) => (
                      <div key={task.id} className="border-2 rounded-sm p-3 bg-muted/20">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm leading-snug">{task.title}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1">{task.area}</p>
                          </div>
                          <Badge variant="destructive" className="text-[0.65rem]">
                            PRIORITÀ
                          </Badge>
                        </div>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Subtask completate: {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <div>
                <h2 className="text-2xl font-bold mb-6">Le tue aree di crescita</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <SectionCard
                    title="Soldi"
                    description="Tour Companion, clienti, trading e finanze"
                    icon={DollarSign}
                    variant="soldi"
                    onNavigate={() => setActiveTab("tour")}
                    stats={[
                      {
                        label: "Task attivi",
                        value: activeTasks,
                      },
                      {
                        label: "Priorità alta",
                        value: highPriorityTasks,
                      },
                    ]}
                  />
                  <SectionCard
                    title="Mente"
                    description="Esperienze, natura, hobby e progetti personali"
                    icon={Brain}
                    variant="mente"
                    onNavigate={() => setActiveTab("mente")}
                    stats={[
                      {
                        label: "Esperienze",
                        value: 0,
                      },
                      {
                        label: "Progetti",
                        value: 0,
                      },
                    ]}
                  />
                  <SectionCard
                    title="Corpo"
                    description="Allenamento, benessere e salute fisica"
                    icon={Heart}
                    variant="corpo"
                    onNavigate={() => setActiveTab("corpo")}
                    stats={[
                      {
                        label: "Allenamenti",
                        value: "0",
                      },
                      {
                        label: "Streak",
                        value: "0 giorni",
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="bg-gradient-hero rounded-sm p-8 border-2">
                <h3 className="text-xl font-bold mb-2">FOCUS OGGI</h3>
                <p className="text-muted-foreground mb-4 font-mono text-sm">
                  Completa i task prioritari e mantieni il ritmo di crescita.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setActiveTab("tour")} className="border-2">
                    <Target className="h-4 w-4 mr-2" />
                    TOUR
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveTab("corpo")} className="border-2">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    WORKOUT
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tour Companion Tab */}
            <TabsContent value="tour" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">TOUR COMPANION</h2>
                <p className="text-muted-foreground text-sm font-mono">Fasi operative e task dedicati</p>
              </div>

              <div className="border-2 rounded-sm p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">Fasi Tour Companion</h3>
                  <p className="text-muted-foreground text-sm font-mono">
                    Seleziona le fasi operative attive.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TOUR_PHASES.map((phase) => {
                    const isActive = tourCompanionPhases.includes(phase);
                    return (
                      <Button
                        key={phase}
                        size="sm"
                        variant={isActive ? "default" : "outline"}
                        className="border-2"
                        onClick={() => togglePhase(phase)}
                      >
                        {phase}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Fasi attive"
                  value={tourCompanionPhases.length > 0 ? tourCompanionPhases.join(" / ") : "Nessuna"}
                  subtitle="Selezione attuale"
                  icon={TrendingUp}
                  variant="soldi"
                />
                <StatCard
                  title="Task totali"
                  value={businessTasks.length + Object.values(tourTasks).reduce((acc, list) => acc + list.length, 0)}
                  subtitle="Tutte le categorie"
                  icon={CheckSquare}
                  variant="soldi"
                />
                <StatCard
                  title="Priorità alta"
                  value={highPriorityTasks}
                  subtitle="Da completare"
                  icon={Target}
                  variant="soldi"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {TOUR_PHASES.map((phase) => (
                  <div key={phase} className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">{phase.toUpperCase()}</h3>
                      <p className="text-muted-foreground text-xs font-mono">Task specifici per la fase {phase}.</p>
                    </div>
                    <TaskList
                      tasks={tourTasks[phase as TourPhase] ?? []}
                      onAddTask={async ({ title, priority }) => {
                        await addTourTask(phase as TourPhase, title, priority);
                      }}
                      onToggleTask={async (task) => {
                        await toggleTourTaskCompletion(task.id, !task.completed);
                      }}
                      onDeleteTask={async (task) => {
                        await deleteTourTask(task.id);
                      }}
                      onAddSubtask={async (task, title) => {
                        await addTourSubtask(task.id, title);
                      }}
                      onToggleSubtask={async (task, subtask) => {
                        await toggleTourSubtaskCompletion(subtask.id, !subtask.completed);
                      }}
                      onDeleteSubtask={async (_task, subtask) => {
                        await deleteTourSubtask(subtask.id);
                      }}
                      categoryOverride={phase}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">BUSINESS & PERFORMANCE</h2>
                <p className="text-muted-foreground text-sm font-mono">
                  Finanze, lavoro, lead e ricavi
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Ricavi registrati"
                  value={moneyTransactions.length}
                  subtitle="Transazioni totali"
                  icon={DollarSign}
                  variant="soldi"
                />
                <StatCard
                  title="Task generali"
                  value={totalBusinessTasks}
                  subtitle="Task e obiettivi"
                  icon={CheckSquare}
                  variant="soldi"
                />
                <StatCard
                  title="Fasi Tour attive"
                  value={tourCompanionPhases.length}
                  subtitle="Monitoraggio"
                  icon={TrendingUp}
                  variant="soldi"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h3 className="text-xl font-semibold">Money Tracker</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2"
                    onClick={handleRefreshTransactions}
                    disabled={loadingTransactions}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    {loadingTransactions ? "Aggiornando..." : "Aggiorna"}
                  </Button>
                </div>
                <MoneyTracker
                  transactions={moneyTransactions}
                  onAddTransaction={handleAddTransaction}
                  onRemoveTransaction={handleRemoveTransaction}
                />
              </div>

              <div className="mb-6">
                <WorkTracker />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Task & Obiettivi</h3>
                <TaskList
                  tasks={businessTasks}
                  onAddTask={async ({ title, priority, category }) => {
                    const area = (category as BusinessArea | undefined) ?? "Business";
                    await addBusinessTask(area, title, priority);
                  }}
                  onToggleTask={async (task) => {
                    await toggleBusinessTaskCompletion(task.id, !task.completed);
                  }}
                  onDeleteTask={async (task) => {
                    await deleteBusinessTask(task.id);
                  }}
                  onAddSubtask={async (task, title) => {
                    await addBusinessSubtask(task.id, title);
                  }}
                  onToggleSubtask={async (_task, subtask) => {
                    await toggleBusinessSubtaskCompletion(subtask.id, !subtask.completed);
                  }}
                  onDeleteSubtask={async (_task, subtask) => {
                    await deleteBusinessSubtask(subtask.id);
                  }}
                />
              </div>
            </TabsContent>

            {/* Mente Tab */}
            <TabsContent value="mente" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">MENTE & CRESCITA</h2>
                <p className="text-muted-foreground text-sm font-mono">
                  Esperienze / Natura / Hobby / Side Projects / Learning
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Esperienze" value="8" subtitle="Questo mese" icon={Sparkles} variant="mente" />
                <StatCard title="Side Projects" value="3" subtitle="In corso" icon={Target} variant="mente" />
                <StatCard title="Uscite Natura" value="12" subtitle="Questo mese" icon={TrendingUp} variant="mente" />
              </div>

              <ExperienceTracker />

              <div className="mb-6">
                <LearningTracker />
              </div>
            </TabsContent>

            {/* Corpo Tab */}
            <TabsContent value="corpo" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">CORPO & PERFORMANCE</h2>
                <p className="text-muted-foreground text-sm font-mono">
                  Training / Nutrition / Physical Health / Aesthetics
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Allenamenti" value="0" subtitle="Questa settimana" icon={Dumbbell} variant="corpo" />
                <StatCard title="Peso" value="0 kg" subtitle="Ultimi 30 giorni" icon={Target} variant="corpo" />
                <StatCard title="Energia" value="0/10" subtitle="Media settimanale" icon={Sparkles} variant="corpo" />
              </div>

              <div className="border-2 rounded-sm p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">Attività fisica</h3>
                  <p className="text-muted-foreground text-sm font-mono">
                    Monitora allenamenti, passi e streak di disciplina.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-2 bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Passi</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {stepsSummary ? `${stepsSummary.weeklyCompleted}/${stepsSummary.weeklyGoal}` : "—"}
                      </span>
                    </div>
                    <Progress
                      value={stepsSummary ? Math.min((stepsSummary.weeklyCompleted / stepsSummary.weeklyGoal) * 100, 100) : 0}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ultimo successo: {stepsSummary?.lastSuccess ?? "—"}
                    </p>
                  </Card>
                  <Card className="border-2 bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Disciplina</span>
                      <span className="text-xs font-mono text-muted-foreground">No Fap: {streakDays} giorni</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mantieni la streak e registra i progressi giornalieri.
                    </p>
                  </Card>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <StepsTracker onSummaryChange={handleStepsSummaryChange} />
                <WellbeingTracker />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <WorkoutTracker />
                <WeightTracker />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <LooksmaxingTracker />
                <MasturbationStreak />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};
export default Index;