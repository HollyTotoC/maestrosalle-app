"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TaskTemplate, Moment, Jour, SpecialTask } from "@/types/todo";
import { Plus, X, PartyPopper } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Timestamp } from "firebase/firestore";
import confetti from "canvas-confetti";
import { useUsersStore } from "@/store/useUsersStore";
import { useUsersStoreSync } from "@/hooks/useUsersStoreSync";
import { useAppStore } from "@/store/store";
import { useUserStore } from "@/store/useUserStore";
import { useTodoStore } from "@/store/useTodoStore";

interface TodoChecklistProps {
  selectedMoment: Moment;
  selectedJour: Jour;
  selectedDate: Date;
}

export default function TodoChecklist({ selectedMoment, selectedJour, selectedDate }: TodoChecklistProps) {
  const [isAddingSpecial, setIsAddingSpecial] = useState(false);
  const [newSpecialTask, setNewSpecialTask] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState<string>("");
  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined);
  const [taskMoment, setTaskMoment] = useState<Moment | undefined>(undefined);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // État optimiste : Map<checklistId, booléen indiquant l'état optimiste>
  const [optimisticStates, setOptimisticStates] = useState<Map<number, boolean>>(new Map());
  // État optimiste pour les tâches spéciales : Map<taskId, booléen indiquant l'état optimiste>
  const [optimisticSpecialStates, setOptimisticSpecialStates] = useState<Map<string, boolean>>(new Map());

  // Synchroniser les utilisateurs depuis Firebase
  useUsersStoreSync();

  // Récupérer les stores
  const users = useUsersStore((state) => state.users);
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
  const currentUserId = useUserStore((state) => state.userId);
  const currentUserName = useUserStore((state) => state.displayName);

  // Store TODO : templates, complétions, tâches spéciales
  const templates = useTodoStore((state) => state.templates);
  const specialTasks = useTodoStore((state) => state.specialTasks);
  const isTaskCompleted = useTodoStore((state) => state.isTaskCompleted);
  const completeTask = useTodoStore((state) => state.completeTask);
  const uncompleteTask = useTodoStore((state) => state.uncompleteTask);
  const addSpecialTaskToStore = useTodoStore((state) => state.addSpecialTask);
  const toggleSpecialTaskInStore = useTodoStore((state) => state.toggleSpecialTask);
  const removeSpecialTaskFromStore = useTodoStore((state) => state.removeSpecialTask);

  // TEMPORAIRE : afficher tous les utilisateurs (pas de filtrage par restaurant pour l'instant)
  // TODO: activer le filtrage quand les utilisateurs seront assignés aux restaurants
  const restaurantUsers = Object.entries(users)
    // .filter(([, user]) => user.restaurantId === selectedRestaurant) // Désactivé pour l'instant
    .map(([id, user]) => ({ id, ...user }));

  // Filtrer les tâches spéciales : afficher toutes les tâches non complétées,
  // et les tâches complétées depuis moins de 7 jours
  const visibleSpecialTasks = specialTasks.filter((task) => {
    // Afficher toutes les tâches non complétées
    if (!task.completed) {
      return true;
    }

    // Pour les tâches complétées, afficher seulement celles de moins de 7 jours
    if (task.completedAt) {
      const completedDate = task.completedAt.toDate();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return completedDate >= sevenDaysAgo;
    }

    return false;
  });

  // Filtrer les tâches templates selon le moment et le jour sélectionnés
  const filteredTasks = templates.filter((task) => {
    const matchesMoment = task.moment.includes(selectedMoment);
    const matchesJour = task.jours.includes(selectedJour);
    return matchesMoment && matchesJour;
  });

  // Séparer les tâches quotidiennes et hebdomadaires
  const quotidienTasks = filteredTasks.filter((task) => task.fréquence === "quotidien");
  const hebdoTasks = filteredTasks.filter((task) => task.fréquence === "hebdo");

  // Helper pour obtenir l'état d'une tâche avec support optimiste
  const getTaskCompletedState = (checklistId: number): boolean => {
    // Si on a un état optimiste, l'utiliser en priorité
    if (optimisticStates.has(checklistId)) {
      return optimisticStates.get(checklistId)!;
    }
    // Sinon utiliser l'état réel du store
    return isTaskCompleted(checklistId, selectedMoment, selectedDate);
  };

  // Helper pour obtenir l'état d'une tâche spéciale avec support optimiste
  const getSpecialTaskCompletedState = (taskId: string): boolean => {
    // Si on a un état optimiste, l'utiliser en priorité
    if (optimisticSpecialStates.has(taskId)) {
      return optimisticSpecialStates.get(taskId)!;
    }
    // Sinon utiliser l'état réel du store
    const task = specialTasks.find((t) => t.id === taskId);
    return task?.completed || false;
  };

  // Basculer l'état d'une tâche template
  const toggleTask = async (template: TaskTemplate) => {
    const currentState = isTaskCompleted(template.checklist_id, selectedMoment, selectedDate);
    const newState = !currentState;

    // 1. Mettre à jour l'état optimiste immédiatement
    setOptimisticStates(new Map(optimisticStates).set(template.checklist_id, newState));

    try {
      if (!currentState) {
        // Marquer comme complétée
        await completeTask({
          templateId: template.id,
          checklist_id: template.checklist_id,
          completedBy: currentUserId || "unknown",
          completedByName: currentUserName || "Utilisateur inconnu",
          moment: selectedMoment,
          jour: selectedJour,
          date: Timestamp.fromDate(selectedDate),
          restaurantId: selectedRestaurant?.id || "",
        });
      } else {
        // Marquer comme non complétée (annuler la complétion)
        await uncompleteTask(template.checklist_id, selectedMoment, selectedDate);
      }

      // 2. Nettoyer l'état optimiste après succès (après un court délai pour laisser Firebase sync)
      setTimeout(() => {
        setOptimisticStates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(template.checklist_id);
          return newMap;
        });
      }, 500);
    } catch (error) {
      // 3. En cas d'erreur, annuler l'état optimiste immédiatement
      console.error("Erreur lors du toggle de la tâche:", error);
      setOptimisticStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(template.checklist_id);
        return newMap;
      });
    }
  };

  const addSpecialTask = async () => {
    if (!newSpecialTask.trim()) return;

    try {
      // Récupérer le nom d'utilisateur si assigné (ignorer "none")
      const finalAssignedToUserId = assignedToUserId && assignedToUserId !== "none" ? assignedToUserId : undefined;
      const assignedUser = finalAssignedToUserId ? users[finalAssignedToUserId] : undefined;

      // Construire l'objet sans les champs undefined (Firestore n'accepte pas undefined)
      const taskData: Omit<SpecialTask, "id" | "isDeleted" | "createdAt"> = {
        tâche: newSpecialTask,
        createdBy: currentUserId || "unknown",
        createdByName: currentUserName || "Utilisateur inconnu",
        completed: false,
        restaurantId: selectedRestaurant?.id || "",
      };

      // Ajouter les champs optionnels seulement s'ils sont définis
      if (finalAssignedToUserId) {
        taskData.assignedTo = finalAssignedToUserId;
      }
      if (assignedUser?.displayName) {
        taskData.assignedToName = assignedUser.displayName;
      }
      if (taskDate) {
        taskData.date = Timestamp.fromDate(taskDate);
      }
      if (taskMoment) {
        taskData.moment = taskMoment;
      }

      await addSpecialTaskToStore(taskData);

      // Réinitialiser le formulaire
      setNewSpecialTask("");
      setAssignedToUserId("");
      setTaskDate(undefined);
      setTaskMoment(undefined);
      setIsAddingSpecial(false);
    } catch (error) {
      console.error("❌ Erreur lors de la création de la tâche spéciale:", error);
      alert("Erreur lors de la création de la tâche : " + (error as Error).message);
    }
  };

  const toggleSpecialTask = async (taskId: string) => {
    const task = specialTasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentState = task.completed;
    const newState = !currentState;

    // 1. Mettre à jour l'état optimiste immédiatement
    setOptimisticSpecialStates(new Map(optimisticSpecialStates).set(taskId, newState));

    try {
      await toggleSpecialTaskInStore(
        taskId,
        currentUserId || "unknown",
        currentUserName || "Utilisateur inconnu"
      );

      // 2. Nettoyer l'état optimiste après succès
      setTimeout(() => {
        setOptimisticSpecialStates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(taskId);
          return newMap;
        });
      }, 500);
    } catch (error) {
      // 3. En cas d'erreur, annuler l'état optimiste immédiatement
      console.error("Erreur lors du toggle de la tâche spéciale:", error);
      setOptimisticSpecialStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
    }
  };

  const deleteSpecialTask = async (taskId: string) => {
    await removeSpecialTaskFromStore(taskId);
  };

  // Calculer le nombre de tâches complétées (avec état optimiste)
  const completedTemplatesCount = filteredTasks.filter((task) =>
    getTaskCompletedState(task.checklist_id)
  ).length;

  // Vérifier si toutes les tâches templates sont complétées (on ne compte PAS les tâches spéciales)
  const allTasksCompleted =
    filteredTasks.length > 0 &&
    completedTemplatesCount === filteredTasks.length;

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

  // Helper pour récupérer la complétion d'une tâche
  const getTaskCompletion = (checklistId: number) => {
    const completions = useTodoStore.getState().completions;

    // Normaliser la date à minuit pour comparaison
    const normalizedDate = new Date(selectedDate);
    normalizedDate.setHours(0, 0, 0, 0);

    return completions.find((completion) => {
      const completionDate = completion.date.toDate();
      completionDate.setHours(0, 0, 0, 0);

      return (
        completion.checklist_id === checklistId &&
        completion.moment === selectedMoment &&
        completionDate.getTime() === normalizedDate.getTime()
      );
    });
  };

  const renderTaskSection = (tasks: TaskTemplate[], title: string, emoji: string) => {
    if (tasks.length === 0) return null;

    const completedCount = tasks.filter((task) =>
      getTaskCompletedState(task.checklist_id)
    ).length;
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
            const completed = getTaskCompletedState(task.checklist_id);
            const completion = getTaskCompletion(task.checklist_id);

            return (
              <div
                key={task.checklist_id}
                className={`flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg border ${
                  completed ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-white dark:bg-neutral-800"
                } transition-colors`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    id={`task-${task.checklist_id}`}
                    checked={completed}
                    onCheckedChange={() => toggleTask(task)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`task-${task.checklist_id}`}
                    className={`flex-1 text-sm cursor-pointer ${
                      completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.tâche}
                  </label>
                </div>
                {completed && completion && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 md:ml-auto pl-8 md:pl-0">
                    <span>
                      ✓ {completion.completedByName}
                    </span>
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={completion.completedBy ? users[completion.completedBy]?.avatarUrl || "" : ""}
                        alt="Avatar"
                      />
                      <AvatarFallback className="text-xs">
                        {completion.completedByName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">
                      • {completion.completedAt.toDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
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
              {completedTemplatesCount}/{filteredTasks.length} tâches complétées
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
            {visibleSpecialTasks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">⭐ Tâches spéciales</h3>
                    <Badge variant="secondary">
                      {visibleSpecialTasks.filter((t) => t.completed).length}/{visibleSpecialTasks.length}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {visibleSpecialTasks.map((task) => {
                    const completed = getSpecialTaskCompletedState(task.id);
                    return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        completed
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                      } transition-colors`}
                    >
                      <Checkbox
                        id={`special-${task.id}`}
                        checked={completed}
                        onCheckedChange={() => toggleSpecialTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`special-${task.id}`}
                          className={`text-sm cursor-pointer block ${
                            completed ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {task.tâche}
                        </label>
                        <div className="space-y-1 mt-1">
                          {task.assignedToName && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Assigné à {task.assignedToName}
                              </span>
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={task.assignedTo ? users[task.assignedTo]?.avatarUrl || "" : ""}
                                  alt="Avatar"
                                />
                                <AvatarFallback className="text-xs">
                                  {task.assignedToName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                          {task.date && task.moment && (
                            <div className="text-xs text-muted-foreground">
                              📅 {task.date.toDate().toLocaleDateString("fr-FR")} - {
                                task.moment === "midi_before" ? "Midi avant service" :
                                task.moment === "midi_after" ? "Midi après service" :
                                task.moment === "soir_before" ? "Soir avant service" :
                                "Soir après service"
                              }
                            </div>
                          )}
                          {!task.date && !task.moment && (
                            <div className="text-xs text-muted-foreground italic">
                              Pas de deadline - À faire dès que possible
                            </div>
                          )}
                          {completed && task.completedByName && task.completedAt && (
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                              <span>
                                ✓ Complété par {task.completedByName}
                              </span>
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={task.completedBy ? users[task.completedBy]?.avatarUrl || "" : ""}
                                  alt="Avatar"
                                />
                                <AvatarFallback className="text-xs">
                                  {task.completedByName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-muted-foreground">
                                • {task.completedAt.toDate().toLocaleDateString("fr-FR")} à {task.completedAt.toDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )}
                        </div>
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
                    );
                  })}
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
                      <Label htmlFor="task-name">Tâche *</Label>
                      <Input
                        id="task-name"
                        placeholder="Ex: Aller chercher la viande chez le boucher"
                        value={newSpecialTask}
                        onChange={(e) => setNewSpecialTask(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="assigned-to">Assigner à (optionnel)</Label>
                      <Select value={assignedToUserId} onValueChange={setAssignedToUserId}>
                        <SelectTrigger id="assigned-to" className="w-full">
                          <SelectValue placeholder="Personne (optionnel)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Personne</SelectItem>
                          {restaurantUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.avatarUrl || ""} alt="Avatar" />
                                  <AvatarFallback className="text-xs">
                                    {(user.displayName || user.email || "?").slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user.displayName || user.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task-date">Date et moment (optionnel)</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Si vide, la tâche apparaîtra à tous les shifts jusqu&apos;à ce qu&apos;elle soit faite
                      </p>
                      <DatePicker
                        date={taskDate}
                        onDateChange={(date) => {
                          setTaskDate(date);
                          // Réinitialiser le moment si on efface la date
                          if (!date) setTaskMoment(undefined);
                        }}
                        placeholder="Pas de deadline"
                      />
                    </div>

                    {taskDate && (
                      <div>
                        <Label htmlFor="task-moment">Moment du service *</Label>
                        <Select value={taskMoment} onValueChange={(value) => setTaskMoment(value as Moment)}>
                          <SelectTrigger id="task-moment" className="w-full">
                            <SelectValue placeholder="Sélectionner le moment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="midi_before">Midi - Avant service</SelectItem>
                            <SelectItem value="midi_after">Midi - Après service</SelectItem>
                            <SelectItem value="soir_before">Soir - Avant service</SelectItem>
                            <SelectItem value="soir_after">Soir - Après service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => {
                        setIsAddingSpecial(false);
                        setNewSpecialTask("");
                        setAssignedToUserId("");
                        setTaskDate(undefined);
                        setTaskMoment(undefined);
                      }}>
                        Annuler
                      </Button>
                      <Button
                        onClick={addSpecialTask}
                        disabled={!newSpecialTask.trim() || (taskDate && !taskMoment)}
                      >
                        Ajouter
                      </Button>
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
