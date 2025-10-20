"use client";

import Navbar from "@/components/Navbar";
import StockTickets from "@/components/StockTickets";
// Le module des tickets de stock
import { Toaster } from "@/components/ui/sonner"; // Notifications
import { useAppStore } from "@/store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxesStacked } from "@fortawesome/free-solid-svg-icons";

export default function StocksPage() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  if (!hasHydrated) return null; // Avoid UI flicker

  return (
    <>
      <div className="flex flex-col min-h-[100dvh]">
        <Navbar />
        <main className="p-4 md:p-6 flex flex-col gap-4 grow max-w-4xl mx-auto w-full">
          {/* Container glassmorphism - Mini-App wrapper */}
          <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
            <div className="mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                <FontAwesomeIcon icon={faBoxesStacked} className="text-primary" />
                Tickets de Stock
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos besoins en stock, suivez leur traitement et clôturez-les.
              </p>
            </div>
            <StockTickets />
          </div>
        </main>
      </div>
      <Toaster />
    </>
  );
}