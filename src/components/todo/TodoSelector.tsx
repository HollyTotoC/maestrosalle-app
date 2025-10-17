"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Moment } from "@/types/todo";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TodoSelectorProps {
  selectedDate: Date;
  selectedMoment: Moment;
  onDateChange: (date: Date) => void;
  onMomentChange: (moment: Moment) => void;
  onResetToNow: () => void;
}

const moments: Record<Moment, { label: string; emoji: string }> = {
  midi_before: { label: "Avant service", emoji: "🌅" },
  midi_after: { label: "Après service", emoji: "🌆" },
  soir_before: { label: "Avant service", emoji: "🌇" },
  soir_after: { label: "Après service", emoji: "🌃" },
};

export default function TodoSelector({
  selectedDate,
  selectedMoment,
  onDateChange,
  onMomentChange,
  onResetToNow,
}: TodoSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const currentService = selectedMoment.startsWith("midi") ? "Midi" : "Soir";
  const momentInfo = moments[selectedMoment];

  return (
    <Card>
      <CardContent className="pt-6">
        {/* En-tête : date + shift + bouton */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          {/* Date et shift */}
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 w-full md:w-auto">
            <h2 className="text-2xl font-bold capitalize">
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </h2>
            <span className="text-sm text-muted-foreground">
              {momentInfo.emoji} {currentService} - {momentInfo.label}
            </span>
          </div>

          {/* Bouton "Revenir maintenant" */}
          <Button variant="outline" size="sm" onClick={onResetToNow} className="gap-2 w-full md:w-auto">
            <Clock className="h-4 w-4" />
            Revenir à maintenant
          </Button>
        </div>

        {/* Sélecteurs */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Sélecteur de date */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start gap-2 w-full md:w-auto">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date);
                    setIsCalendarOpen(false);
                  }
                }}
                locale={fr}
              />
            </PopoverContent>
          </Popover>

          {/* Sélecteur de service (Midi/Soir) - desktop: inline, mobile: grille pleine largeur */}
          <Tabs
            value={currentService.toLowerCase()}
            onValueChange={(value) => {
              const isBefore = selectedMoment.includes("before");
              const newMoment: Moment = value === "midi"
                ? (isBefore ? "midi_before" : "midi_after")
                : (isBefore ? "soir_before" : "soir_after");
              onMomentChange(newMoment);
            }}
            className="w-full md:w-auto"
          >
            <TabsList className="h-9 w-full md:w-auto grid grid-cols-2 md:inline-flex">
              <TabsTrigger value="midi" className="text-sm">🌅 Midi</TabsTrigger>
              <TabsTrigger value="soir" className="text-sm">🌇 Soir</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sélecteur Avant/Après service - desktop: inline, mobile: grille pleine largeur */}
          <Tabs
            value={selectedMoment.includes("before") ? "before" : "after"}
            onValueChange={(value) => {
              const isMidi = selectedMoment.startsWith("midi");
              const newMoment: Moment = isMidi
                ? (value === "before" ? "midi_before" : "midi_after")
                : (value === "before" ? "soir_before" : "soir_after");
              onMomentChange(newMoment);
            }}
            className="w-full md:w-auto"
          >
            <TabsList className="h-9 w-full md:w-auto grid grid-cols-2 md:inline-flex">
              <TabsTrigger value="before" className="text-sm">Avant service</TabsTrigger>
              <TabsTrigger value="after" className="text-sm">Après service</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
