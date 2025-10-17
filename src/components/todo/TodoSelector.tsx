"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Moment, Jour } from "@/types/todo";
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
        {/* En-tête principal avec date et moment */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold capitalize">
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </h2>
            <span className="text-sm text-muted-foreground">
              {momentInfo.emoji} {currentService} - {momentInfo.label}
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={onResetToNow} className="gap-2">
            <Clock className="h-4 w-4" />
            Revenir à maintenant
          </Button>
        </div>

        {/* Sélecteurs sur une seule ligne */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Sélecteur de date */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start gap-2">
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

          {/* Sélecteur de service (Midi/Soir) */}
          <Tabs
            value={currentService.toLowerCase()}
            onValueChange={(value) => {
              const isBefore = selectedMoment.includes("before");
              const newMoment: Moment = value === "midi"
                ? (isBefore ? "midi_before" : "midi_after")
                : (isBefore ? "soir_before" : "soir_after");
              onMomentChange(newMoment);
            }}
          >
            <TabsList className="h-9">
              <TabsTrigger value="midi" className="text-sm">🌅 Midi</TabsTrigger>
              <TabsTrigger value="soir" className="text-sm">🌇 Soir</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sélecteur Avant/Après service */}
          <Tabs
            value={selectedMoment.includes("before") ? "before" : "after"}
            onValueChange={(value) => {
              const isMidi = selectedMoment.startsWith("midi");
              const newMoment: Moment = isMidi
                ? (value === "before" ? "midi_before" : "midi_after")
                : (value === "before" ? "soir_before" : "soir_after");
              onMomentChange(newMoment);
            }}
          >
            <TabsList className="h-9">
              <TabsTrigger value="before" className="text-sm">Avant</TabsTrigger>
              <TabsTrigger value="after" className="text-sm">Après</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
