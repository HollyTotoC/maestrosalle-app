"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import TodoSelector from "@/components/todo/TodoSelector";
import TodoChecklist from "@/components/todo/TodoChecklist";
import { Moment, Jour } from "@/types/todo";
import { useAppStore } from "@/store/store";
import { useTodoStoreSync } from "@/hooks/useTodoStoreSync";

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
  const dayIndex = date.getDay(); // 0 = dimanche, 1 = lundi, etc.
  const joursArray: Jour[] = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  return joursArray[dayIndex];
}

export default function TodoPage() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMoment, setSelectedMoment] = useState<Moment>(getAutoMoment());

  // Synchroniser les todos avec Firebase pour le restaurant sélectionné
  useTodoStoreSync(selectedRestaurant?.id || "", selectedDate);

  const handleResetToNow = () => {
    setSelectedDate(new Date());
    setSelectedMoment(getAutoMoment());
  };

  // Convertir la date en jour pour le filtre
  const selectedJour = getJourFromDate(selectedDate);

  if (!hasHydrated) return null; // Avoid UI flicker

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-4 flex flex-col gap-6 grow max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold">📝 Tâches du service</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Liste des tâches à accomplir pour chaque service
          </p>
        </div>

        <TodoSelector
          selectedDate={selectedDate}
          selectedMoment={selectedMoment}
          onDateChange={setSelectedDate}
          onMomentChange={setSelectedMoment}
          onResetToNow={handleResetToNow}
        />

        <TodoChecklist selectedMoment={selectedMoment} selectedJour={selectedJour} selectedDate={selectedDate} />
      </main>
    </div>
  );
}
