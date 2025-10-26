import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";

interface WorkoutExercise {
  name: string;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
  completed: boolean;
}

export const WorkoutTracker = () => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([
    {
      day: "Lunedì",
      focus: "Petto + Tricipiti",
      exercises: [
        { name: "Panca piana con manubri", notes: "4x10 · discesa controllata 3 sec" },
        { name: "Panca inclinata", notes: "4x12 · inclina appoggiando la panca" },
        { name: "Croci su panca piana", notes: "3x15" },
        { name: "Push down carrucola", notes: "4x12" },
        { name: "French press manubrio singolo", notes: "3x10 dietro la testa" },
        { name: "Dips tra due sedie", notes: "3x max · anche parziali" },
      ],
      completed: false,
    },
    {
      day: "Martedì",
      focus: "Schiena + Bicipiti",
      exercises: [
        { name: "Rematore con manubrio singolo", notes: "4x10 per lato" },
        { name: "Rematore con due manubri stile pendlay", notes: "3x12" },
        { name: "Trazioni negative", notes: "3x6 · discesa 5-7 sec" },
        { name: "Curl con manubri alternato", notes: "4x12" },
        { name: "Curl concentrato su panca", notes: "3x10" },
        { name: "Curl presa martello", notes: "3x12" },
      ],
      completed: false,
    },
    {
      day: "Mercoledì",
      focus: "Gambe + Addome",
      exercises: [
        { name: "Squat con manubri", notes: "4x15" },
        { name: "Affondi statici", notes: "4x12 per gamba" },
        { name: "Stacchi rumeni con manubri", notes: "4x12" },
        { name: "Calf raises", notes: "4x20" },
        { name: "Crunch su panca", notes: "3x20" },
        { name: "Plank", notes: "3x 45-60 sec" },
      ],
      completed: false,
    },
    {
      day: "Giovedì",
      focus: "Spalle + Tricipiti",
      exercises: [
        { name: "Military press con manubri", notes: "4x10" },
        { name: "Alzate laterali", notes: "4x15" },
        { name: "Alzate frontali", notes: "3x12" },
        { name: "Push down carrucola presa stretta", notes: "4x12" },
        { name: "Estensioni dietro la testa", notes: "3x10" },
        { name: "Dips parziali", notes: "3x max" },
      ],
      completed: false,
    },
    {
      day: "Venerdì",
      focus: "Schiena + Bicipiti",
      exercises: [
        { name: "Rematore unilaterale con manubrio", notes: "4x10" },
        { name: "Trazioni negative", notes: "3x6" },
        { name: "Curl con supinazione", notes: "4x12" },
        { name: "Curl a 21", notes: "3 serie" },
        { name: "Reverse curl", notes: "3x12" },
      ],
      completed: false,
    },
    {
      day: "Sabato",
      focus: "Full body + Addome",
      exercises: [
        { name: "Panca piana con manubri", notes: "4x10" },
        { name: "Rematore con manubrio", notes: "4x10" },
        { name: "Squat con manubri", notes: "4x15" },
        { name: "Military press", notes: "3x12" },
        { name: "Curl + French press superset", notes: "3x12+12" },
        { name: "Crunch + Plank", notes: "3 giri" },
      ],
      completed: false,
    },
    {
      day: "Domenica",
      focus: "Recupero",
      exercises: [
        { name: "Riposo attivo / mobilità leggera", notes: "Respira, stretching, journaling" },
      ],
      completed: false,
    },
  ]);

  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState("");

  const toggleComplete = (day: string) => {
    setWorkoutPlan(
      workoutPlan.map((d) => (d.day === day ? { ...d, completed: !d.completed } : d))
    );
  };

  const addExercise = (day: string) => {
    if (!newExercise.trim()) return;

    setWorkoutPlan(
      workoutPlan.map((d) =>
        d.day === day
          ? {
              ...d,
              exercises: [...d.exercises, { name: newExercise.trim() }],
            }
          : d
      )
    );
    setNewExercise("");
  };

  const removeExercise = (day: string, exercise: WorkoutExercise) => {
    setWorkoutPlan(
      workoutPlan.map((d) =>
        d.day === day
          ? { ...d, exercises: d.exercises.filter((e) => e.name !== exercise.name) }
          : d
      )
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workoutPlan.map((day, index) => (
        <Card key={index} className="p-4 border-2">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-sm bg-corpo-light border-2">
                <Dumbbell className="h-4 w-4 text-corpo" />
              </div>
              <div>
                <h4 className="font-bold">{day.day}</h4>
                <p className="text-xs text-muted-foreground font-mono">
                  {day.focus} · {day.exercises.length} esercizi
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setEditingDay(editingDay === day.day ? null : day.day)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              {day.completed && (
                <Badge className="bg-corpo text-white text-xs">OK</Badge>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {day.exercises.map((exercise, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      day.completed ? "bg-corpo" : "bg-muted"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className={day.completed ? "text-muted-foreground" : ""}>{exercise.name}</span>
                    {exercise.notes && (
                      <span className="text-[0.7rem] text-muted-foreground font-mono">
                        {exercise.notes}
                      </span>
                    )}
                  </div>
                </div>
                {editingDay === day.day && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => removeExercise(day.day, exercise)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {editingDay === day.day && (
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Nuovo esercizio..."
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addExercise(day.day)}
                className="h-8 text-sm border-2"
              />
              <Button
                size="icon"
                className="h-8 w-8 border-2"
                onClick={() => addExercise(day.day)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}

          <Button
            variant={day.completed ? "outline" : "default"}
            size="sm"
            className="w-full border-2"
            onClick={() => toggleComplete(day.day)}
          >
            {day.completed ? "Resetta" : "Completa"}
          </Button>
        </Card>
      ))}
    </div>
  );
};
