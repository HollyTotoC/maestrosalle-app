"use client";

import Navbar from "@/components/Navbar";
import StockTickets from "@/components/StockTickets";
// Le module des tickets de stock
import { Toaster } from "@/components/ui/sonner"; // Notifications

export default function StocksPage() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="p-4 flex flex-col gap-4 grow">
          <h1 className="text-3xl font-bold">📦 Tickets de Stock</h1>
          <p className="">
            Gérez vos besoins en stock, suivez leur traitement et clôturez-les.
          </p>
          <StockTickets />
        </main>
      </div>
      <Toaster />
    </>
  );
}