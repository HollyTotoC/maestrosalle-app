"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskTemplate, Moment, Jour, SpecialTask } from "@/types/todo";
import { Plus, X, PartyPopper } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import tasksData from "./base.json";
import { Timestamp } from "firebase/firestore";
import confetti from "canvas-confetti";

interface TodoChecklistProps {
  selectedMoment: Moment;
  selectedJour: Jour;
}

export default function TodoChecklist({ selectedMoment, selectedJour }: TodoChecklistProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [specialTasks, setSpecialTasks] = useState<SpecialTask[]>([]);
  const [isAddingSpecial, setIsAddingSpecial] = useState(false);
  const [newSpecialTask, setNewSpecialTask] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Filtrer les tâches selon le moment et le jour sélectionnés
  const filteredTasks = (tasksData as TaskTemplate[]).filter((task) => {
    const matchesMoment = task.moment.includes(selectedMoment);
    const matchesJour = task.jours.includes(selectedJour);
    return matchesMoment && matchesJour;
  });

  // Séparer les tâches quotidiennes et hebdomadaires
  const quotidienTasks = filteredTasks.filter((task) => task.fréquence === "quotidien");
  const hebdoTasks = filteredTasks.filter((task) => task.fréquence === "hebdo");

  const toggleTask = (taskId: number) => {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const addSpecialTask = () => {
    if (!newSpecialTask.trim()) return;

    const newTask: SpecialTask = {
      id: Date.now().toString(),
      tâche: newSpecialTask,
      assignedTo: assignedTo || undefined,
      assignedToName: assignedTo || undefined,
      createdAt: Timestamp.now(),
      createdBy: "currentUser", // TODO: remplacer par userId réel
      date: Timestamp.now(),
      moment: selectedMoment,
      completed: false,
      restaurantId: "currentRestaurant", // TODO: remplacer par restaurantId réel
    };

    setSpecialTasks((prev) => [...prev, newTask]);
    setNewSpecialTask("");
    setAssignedTo("");
    setIsAddingSpecial(false);
  };

  const toggleSpecialTask = (taskId: string) => {
    setSpecialTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? Timestamp.now() : undefined,
              completedBy: !task.completed ? "currentUser" : undefined,
            }
          : task
      )
    );
  };

  const deleteSpecialTask = (taskId: string) => {
    setSpecialTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  // Vérifier si toutes les tâches sont complétées
  const allTasksCompleted =
    filteredTasks.length > 0 &&
    completedTasks.size === filteredTasks.length &&
    specialTasks.every((task) => task.completed);

  // Déclencher la célébration quand tout est complété
  useEffect(() => {
    if (allTasksCompleted && !hasCelebrated) {
      setShowCelebration(true);
      setHasCelebrated(true);
      // Lancer les confettis !
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD700", "#FFA500", "#FF6347", "#87CEEB", "#98FB98"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD700", "#FFA500", "#FF6347", "#87CEEB", "#98FB98"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [allTasksCompleted, hasCelebrated]);

  // Réinitialiser la célébration quand les tâches deviennent incomplètes
  useEffect(() => {
    if (!allTasksCompleted && hasCelebrated) {
      setHasCelebrated(false);
    }
  }, [allTasksCompleted, hasCelebrated]);

  const renderTaskSection = (tasks: TaskTemplate[], title: string, emoji: string) => {
    if (tasks.length === 0) return null;

    const completedCount = tasks.filter((task) => completedTasks.has(task.checklist_id)).length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold">
            {emoji} {title}
          </h3>
          <Badge variant={progress === 100 ? "default" : "secondary"}>
            {completedCount}/{tasks.length} ({progress}%)
          </Badge>
        </div>
        <div className="space-y-2">
          {tasks.map((task) => {
            const isCompleted = completedTasks.has(task.checklist_id);
            return (
              <div
                key={task.checklist_id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  isCompleted ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-white dark:bg-neutral-800"
                } transition-colors`}
              >
                <Checkbox
                  id={`task-${task.checklist_id}`}
                  checked={isCompleted}
                  onCheckedChange={() => toggleTask(task.checklist_id)}
                  className="mt-1"
                />
                <label
                  htmlFor={`task-${task.checklist_id}`}
                  className={`flex-1 text-sm cursor-pointer ${
                    isCompleted ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.tâche}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Modale de célébration */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <PartyPopper className="h-8 w-8 text-yellow-500" />
              Bravo !
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p className="text-4xl">🎉</p>
            <p className="text-lg font-semibold">
              Toutes les tâches sont accomplies !
            </p>
            <p className="text-muted-foreground">
              Merci pour votre excellent travail ! 💪
            </p>
          </div>
          <Button onClick={() => setShowCelebration(false)} className="w-full">
            Fermer
          </Button>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Liste des tâches</span>
            <Badge variant="outline">
              {completedTasks.size}/{filteredTasks.length} tâches complétées
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune tâche pour ce moment et ce jour.</p>
          </div>
        ) : (
          <>
            {/* Tâches spéciales */}
            {specialTasks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">⭐ Tâches spéciales</h3>
                    <Badge variant="secondary">
                      {specialTasks.filter((t) => t.completed).length}/{specialTasks.length}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {specialTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        task.completed
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                      } transition-colors`}
                    >
                      <Checkbox
                        id={`special-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => toggleSpecialTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`special-${task.id}`}
                          className={`text-sm cursor-pointer block ${
                            task.completed ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {task.tâche}
                        </label>
                        {task.assignedToName && (
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {task.assignedToName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              Assigné à {task.assignedToName}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteSpecialTask(task.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton Ajouter tâche spéciale */}
            <div className="mb-6">
              <Dialog open={isAddingSpecial} onOpenChange={setIsAddingSpecial}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter une tâche spéciale
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvelle tâche spéciale</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-name">Tâche</Label>
                      <Input
                        id="task-name"
                        placeholder="Ex: Aller chercher la viande chez le boucher"
                        value={newSpecialTask}
                        onChange={(e) => setNewSpecialTask(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="assigned-to">Assigner à (optionnel)</Label>
                      <Input
                        id="assigned-to"
                        placeholder="Nom de la personne"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsAddingSpecial(false)}>
                        Annuler
                      </Button>
                      <Button onClick={addSpecialTask}>Ajouter</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {renderTaskSection(quotidienTasks, "Tâches quotidiennes", "📋")}
            {renderTaskSection(hebdoTasks, "Tâches hebdomadaires", "📅")}
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
}
