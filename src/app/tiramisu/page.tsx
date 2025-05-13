"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AddBatchForm from "@/components/tiramisu/AddBatchForm";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import UpdateTiramisuStockForm from "@/components/tiramisu/UpdateTiramisuStockForm";
import TiramisuList from "@/components/tiramisu/TiramisuList";

export default function TiramisuPage() {
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isUpdateServiceOpen, setIsUpdateServiceOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-4 flex flex-col gap-4 grow">
        <h1 className="text-3xl font-bold">🍰 Gestion du Tiramisu</h1>
        <p className="text-gray-600">
          Suivez vos stocks de tiramisu, enregistrez les services et anticipez les besoins.
        </p>

        {/* Boutons pour ouvrir les drawers */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
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
      </main>
    </div>
  );
}