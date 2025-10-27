import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { DEFAULT_WORKOUT_PLAN, useWorkoutService } from "@/lib/workoutService";

interface WorkoutExercise {
  name: string;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
}

export const WorkoutTracker = () => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>(
    DEFAULT_WORKOUT_PLAN.map((day) => ({
      day: day.day,
      focus: day.focus,
      exercises: day.exercises.map((exercise) => ({ ...exercise })),
    })),
  );
  const { logsByDay, setCompletion, loading } = useWorkoutService();

  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState("");

  const toggleComplete = async (day: string) => {
    const isCompleted = logsByDay.get(day)?.completed ?? false;
    await setCompletion(day, !isCompleted);
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
              {logsByDay.get(day.day)?.completed && <Badge className="bg-corpo text-white text-xs">OK</Badge>}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {day.exercises.map((exercise, i) => {
              const log = logsByDay.get(day.day);
              const isCompleted = log?.completed ?? false;
              return (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        isCompleted ? "bg-corpo" : "bg-muted"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className={isCompleted ? "text-muted-foreground" : ""}>{exercise.name}</span>
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
              );
            })}
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

          {(() => {
            const log = logsByDay.get(day.day);
            const isCompleted = log?.completed ?? false;
            return (
              <Button
                variant={isCompleted ? "outline" : "default"}
                size="sm"
                className="w-full border-2"
                onClick={() => void toggleComplete(day.day)}
                disabled={loading}
              >
                {isCompleted ? "Resetta" : "Completa"}
              </Button>
            );
          })()}
        </Card>
      ))}
    </div>
  );
};
