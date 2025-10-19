import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faStar, faCheck, faArrowRight, faListCheck, faCalendarDays, faX } from "@fortawesome/free-solid-svg-icons";
import { SectionSeparatorStack } from "./SectionSeparatorStack";
import { useAppStore } from "@/store/store";
import { useUserStore } from "@/store/useUserStore";
import { useTodoStore } from "@/store/useTodoStore";
import { useTodoStoreSync } from "@/hooks/useTodoStoreSync";
import { Moment, Jour } from "@/types/todo";
import { Checkbox } from "@/components/ui/checkbox";

// Fonction pour détecter automatiquement le moment
function getAutoMoment(): Moment {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return "midi_before";
  } else if (hour >= 12 && hour < 17) {
    return "midi_after";
  } else if (hour >= 17 && hour < 21) {
    return "soir_before";
  } else {
    return "soir_after";
  }
}

// Fonction pour convertir une date en jour de la semaine
function getJourFromDate(date: Date): Jour {
  const dayIndex = date.getDay();
  const joursArray: Jour[] = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  return joursArray[dayIndex];
}

export default function TodoSection() {
  const selectedRestaurant = useAppStore((s) => s.selectedRestaurant);
  const userId = useUserStore((s) => s.userId);
  const displayName = useUserStore((s) => s.displayName);

  const specialTasks = useTodoStore((s) => s.specialTasks);
  const templates = useTodoStore((s) => s.templates);
  const isTaskCompleted = useTodoStore((s) => s.isTaskCompleted);
  const toggleSpecialTask = useTodoStore((s) => s.toggleSpecialTask);
  const addSpecialTask = useTodoStore((s) => s.addSpecialTask);
  const removeSpecialTask = useTodoStore((s) => s.removeSpecialTask);

  const [newTaskText, setNewTaskText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const today = new Date();
  const currentMoment = getAutoMoment();
  const currentJour = getJourFromDate(today);

  // Synchroniser avec Firebase
  useTodoStoreSync(selectedRestaurant?.id || "", today);

  // Filtrer les tâches spéciales visibles (non supprimées, et complétées depuis moins de 7 jours)
  const visibleSpecialTasks = useMemo(() =>
    specialTasks.filter((task) => {
      // Ne pas afficher les tâches supprimées
      if (task.isDeleted) return false;

      // Afficher toutes les tâches non complétées
      if (!task.completed) return true;

      // Pour les tâches complétées, afficher seulement celles de moins de 7 jours
      if (task.completedAt) {
        const completedDate = task.completedAt.toDate();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return completedDate >= sevenDaysAgo;
      }

      return false;
    }),
    [specialTasks]
  );

  // Calculer la progression des tâches quotidiennes (templates du moment actuel)
  const todayProgress = useMemo(() => {
    const todayTemplates = templates.filter(t =>
      t.moment.includes(currentMoment) && t.jours.includes(currentJour)
    );

    const completedToday = todayTemplates.filter(t =>
      isTaskCompleted(t.checklist_id, currentMoment, today)
    ).length;

    return {
      total: todayTemplates.length,
      completed: completedToday,
      percent: todayTemplates.length > 0 ? (completedToday / todayTemplates.length) * 100 : 0
    };
  }, [templates, isTaskCompleted, currentMoment, currentJour, today]);

  const handleAddSpecialTask = async () => {
    if (!newTaskText.trim() || !selectedRestaurant?.id || !userId || !displayName) return;

    await addSpecialTask({
      restaurantId: selectedRestaurant.id,
      tâche: newTaskText.trim(),
      completed: false,
      createdBy: userId,
      createdByName: displayName,
    });

    setNewTaskText("");
    setShowInput(false);
  };

  const handleToggleSpecialTask = async (taskId: string) => {
    if (!userId || !displayName) return;
    await toggleSpecialTask(taskId, userId, displayName);
  };

  const handleDeleteSpecialTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le toggle de la tâche
    await removeSpecialTask(taskId);
  };

  return (
    <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-6 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <FontAwesomeIcon icon={faListCheck} className="text-primary" />
          À faire
        </h2>
      </div>
      <SectionSeparatorStack space={2} className="mb-2 hidden dark:block" />

      {/* Tâches spéciales/importantes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <FontAwesomeIcon icon={faStar} className="text-warning" />
          Tâches importantes
        </h3>

        {visibleSpecialTasks.length === 0 && !showInput && (
          <p className="text-sm text-muted-foreground italic">Aucune tâche importante en cours</p>
        )}

        <div className="space-y-2">
          {visibleSpecialTasks.map(task => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-xl dark:rounded-lg border transition-all duration-200 ${
                task.completed
                  ? "bg-success/10 dark:bg-success/5 border-success/30"
                  : "bg-warning/10 dark:bg-warning/5 border-warning/30"
              }`}
            >
              {/* Checkbox */}
              <Checkbox
                id={`special-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => handleToggleSpecialTask(task.id)}
                className="mt-0.5 shrink-0"
              />

              {/* Contenu de la tâche sur une ligne */}
              <div className="flex-1 min-w-0 flex items-center flex-wrap gap-2 text-sm">
                <span className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.tâche}
                </span>
                {task.assignedToName && (
                  <span className="text-xs text-muted-foreground">
                    • Assigné à {task.assignedToName}
                  </span>
                )}
                {task.date && task.moment && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    • <FontAwesomeIcon icon={faCalendarDays} className="w-3 h-3" />
                    {task.date.toDate().toLocaleDateString("fr-FR")}
                    {" "}
                    {task.moment === "midi_before" ? "Midi avant" :
                     task.moment === "midi_after" ? "Midi après" :
                     task.moment === "soir_before" ? "Soir avant" : "Soir après"}
                  </span>
                )}
                {!task.date && !task.moment && (
                  <span className="text-xs text-muted-foreground italic">
                    • Pas de deadline
                  </span>
                )}
              </div>

              {/* Bouton X - reste en haut à droite */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 self-start hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => handleDeleteSpecialTask(task.id, e)}
              >
                <FontAwesomeIcon icon={faX} className="text-xs" />
              </Button>
            </div>
          ))}
        </div>

        {/* Formulaire d'ajout de tâche spéciale */}
        {!showInput ? (
          <Button
            onClick={() => setShowInput(true)}
            variant="outline"
            size="sm"
            className="w-full border-dashed border-2 border-warning/30 text-warning hover:bg-warning/10 hover:border-warning transition-all duration-200"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Ajouter une tâche importante
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSpecialTask()}
              placeholder="Nouvelle tâche importante..."
              className="flex-1 bg-background/50 backdrop-blur-sm"
              autoFocus
            />
            <Button onClick={handleAddSpecialTask} size="icon" className="shrink-0 bg-warning hover:bg-warning/90">
              <FontAwesomeIcon icon={faCheck} />
            </Button>
            <Button onClick={() => { setShowInput(false); setNewTaskText(""); }} size="icon" variant="ghost" className="shrink-0">
              ✕
            </Button>
          </div>
        )}
      </div>

      {/* Progression quotidienne */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Tâches quotidiennes</h3>
          <span className="text-xs text-muted-foreground font-mono">{todayProgress.completed}/{todayProgress.total}</span>
        </div>
        <Progress value={todayProgress.percent} className="h-2.5" />

        {/* Call-to-action "Voir tout" bien visible */}
        <Button
          onClick={() => window.location.href = "/tools/todo"}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
        >
          Voir toutes les tâches quotidiennes
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}