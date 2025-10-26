import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "alta" | "normale";
  category: string;
  subtasks?: SubTask[];
}

interface TaskListProps {
  tasks: Task[];
  onAddTask: (input: { title: string; priority: Task["priority"]; category?: string }) => Promise<void> | void;
  onToggleTask: (task: Task) => Promise<void> | void;
  onDeleteTask: (task: Task) => Promise<void> | void;
  onAddSubtask: (task: Task, title: string) => Promise<void> | void;
  onToggleSubtask: (task: Task, subtask: SubTask) => Promise<void> | void;
  onDeleteSubtask: (task: Task, subtask: SubTask) => Promise<void> | void;
  categoryOverride?: string;
}

export const TaskList = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  categoryOverride,
}: TaskListProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newTask, setNewTask] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"alta" | "normale">("normale");
  const [newSubtask, setNewSubtask] = useState<{ [key: string]: string }>({});
  const [addingTask, setAddingTask] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState<string | null>(null);

  const addTask = async () => {
    if (!newTask.trim() || addingTask) return;
    setAddingTask(true);
    try {
      await onAddTask({
        title: newTask.trim(),
        priority: newTaskPriority,
        category: categoryOverride,
      });
      setNewTask("");
    } finally {
      setAddingTask(false);
    }
  };

  const addSubtask = async (task: Task) => {
    const subtaskTitle = newSubtask[task.id];
    if (!subtaskTitle?.trim() || addingSubtask === task.id) return;
    setAddingSubtask(task.id);
    try {
      await onAddSubtask(task, subtaskTitle.trim());
      setNewSubtask({ ...newSubtask, [task.id]: "" });
    } finally {
      setAddingSubtask(null);
    }
  };

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter((st) => st.completed).length;
    return (completed / task.subtasks.length) * 100;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border-2">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nuova task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="border-2"
          />
          <Button
            size="icon"
            variant={newTaskPriority === "alta" ? "default" : "outline"}
            onClick={() => setNewTaskPriority(newTaskPriority === "alta" ? "normale" : "alta")}
            className="shrink-0 border-2"
          >
            !
          </Button>
          <Button onClick={addTask} size="icon" className="shrink-0 border-2" disabled={addingTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="border-2 rounded-sm">
              <div className="flex items-center gap-3 p-3 bg-muted/30">
                <Checkbox checked={task.completed} onCheckedChange={() => onToggleTask(task)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className={`font-semibold ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleExpand(task.id)}
                      >
                        {expandedTasks.has(task.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge
                      variant={task.priority === "alta" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {task.priority === "alta" ? "ALTA" : "NORMALE"}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-2">
                      {task.category}
                    </Badge>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
                      </span>
                    )}
                  </div>
                  {task.subtasks && task.subtasks.length > 0 && (
                    <Progress value={getProgress(task)} className="h-1 mt-2" />
                  )}
                </div>
                <Button size="icon" variant="ghost" onClick={() => onDeleteTask(task)} className="shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedTasks.has(task.id) && task.subtasks && (
                <div className="p-3 space-y-2 border-t-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 pl-4">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => onToggleSubtask(task, subtask)}
                      />
                      <p
                        className={`flex-1 text-sm ${
                          subtask.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {subtask.title}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => onDeleteSubtask(task, subtask)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2 pl-4 mt-2">
                    <Input
                      placeholder="Nuova subtask..."
                      value={newSubtask[task.id] || ""}
                      onChange={(e) => setNewSubtask({ ...newSubtask, [task.id]: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && addSubtask(task)}
                      className="h-8 text-sm border-2"
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 border-2"
                      onClick={() => addSubtask(task)}
                      disabled={addingSubtask === task.id}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
