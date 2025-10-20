"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AddBatchForm from "@/components/tiramisu/AddBatchForm";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import UpdateTiramisuStockForm from "@/components/tiramisu/UpdateTiramisuStockForm";
import TiramisuList from "@/components/tiramisu/TiramisuList";
import { useAppStore } from "@/store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCakeCandles } from "@fortawesome/free-solid-svg-icons";

export default function TiramisuPage() {
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isUpdateServiceOpen, setIsUpdateServiceOpen] = useState(false);

          const hasHydrated = useAppStore((state) => state.hasHydrated);
      
          if (!hasHydrated) return null; // Avoid UI flicker
  

  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <main className="p-4 md:p-6 flex flex-col gap-4 max-w-4xl mx-auto grow">
        {/* Container glassmorphism - Mini-App wrapper */}
        <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
              <FontAwesomeIcon icon={faCakeCandles} className="text-primary" />
              Gestion du Tiramisu
            </h1>
            <p className="text-muted-foreground mt-2">
              Suivez vos stocks de tiramisu, enregistrez les services et anticipez les besoins.
            </p>
          </div>

          {/* Boutons pour ouvrir les drawers */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button onClick={() => setIsAddBatchOpen(true)}>Ajouter un batch</Button>
            <Button onClick={() => setIsUpdateServiceOpen(true)}>Mise à jour après un service</Button>
          </div>

          {/* Liste des batches */}
          <TiramisuList />

        {/* Drawer pour ajouter un batch */}
        <Drawer open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
          <DrawerContent>
            <AddBatchForm onClose={() => setIsAddBatchOpen(false)} />
          </DrawerContent>
        </Drawer>

        {/* Drawer pour mettre à jour un service */}
        <Drawer open={isUpdateServiceOpen} onOpenChange={setIsUpdateServiceOpen}>
          <DrawerContent>
            <UpdateTiramisuStockForm onClose={() => setIsUpdateServiceOpen(false)} />
          </DrawerContent>
        </Drawer>
        </div>
      </main>
    </div>
  );
}