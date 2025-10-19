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
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="p-4 flex flex-col gap-4 grow">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxesStacked} />
            Tickets de Stock
          </h1>
          <p className="text-muted-foreground">
            Gérez vos besoins en stock, suivez leur traitement et clôturez-les.
          </p>
          <StockTickets />
        </main>
      </div>
      <Toaster />
    </>
  );
}