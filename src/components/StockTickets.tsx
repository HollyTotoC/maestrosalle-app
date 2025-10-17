"use client";

import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTicketStore } from "@/store/useTicketStore";
import { Skeleton } from "./ui/skeleton";
import { Ticket, TicketStatus } from "@/types/ticket";
import { Separator } from "./ui/separator";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";


const statuses: Record<TicketStatus, string> = {
    new: "🆕 Nouveau",
    seen: "📤 Vu",
    in_progress: "🚚 En cours",
    resolved: "✅ Résolu",
  };

function getRandomHeight() {
  const heights = ["h-2", "h-4", "h-6"]; // Différentes hauteurs possibles
  return heights[Math.floor(Math.random() * heights.length)];
}

export const listenToTickets = (restaurantId: string, callback: (tickets: Ticket[]) => void) => {
  const ticketsRef = collection(db, "tickets");
  const q = query(
    ticketsRef,
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Ticket[];
    callback(tickets);
  });

  return unsubscribe; // Permet de stopper l'écoute si nécessaire
};

export default function StockTickets() {
  const { tickets, addTicket, updateTicket, deleteTicket } = useTicketStore();
  const [isLoading, setIsLoading] = useState(true); // Ajout de l'état de chargement
  const [newTicket, setNewTicket] = useState({ item: "", note: "" });
  const [currentTicket, setCurrentTicket] = useState<string | null>(null); // Ticket en cours de modification
  const [deliveryNote, setDeliveryNote] = useState("");
  const [expectedDeliveryAt, setExpectedDeliveryAt] = useState("");
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null); // Ticket à supprimer

  useEffect(() => {
    const restaurantId = "exampleRestaurantId"; // Remplacez par l'ID du restaurant actuel
    const unsubscribe = listenToTickets(restaurantId, (tickets) => {
      useTicketStore.getState().setTickets(tickets); // Mettez à jour l'état avec les tickets en temps réel
      setIsLoading(false);
    });

    return () => unsubscribe(); // Nettoyage lors du démontage
  }, []);

  const createTicket = () => {
    if (!newTicket.item) return alert("Le champ 'item' est obligatoire.");
    const restaurantId = "exampleRestaurantId"; // Remplacez par l'ID du restaurant actuel
    const createdBy = "exampleUserId"; // Remplacez par l'ID de l'utilisateur actuel
    const createdAt = Timestamp.now();

    addTicket({ ...newTicket, restaurantId, createdBy, createdAt, status: "new" });
    setNewTicket({ item: "", note: "" });
  };

  const updateTicketStatus = (ticketId: string, newStatus: "new" | "seen" | "in_progress" | "resolved") => {
    const updatedBy = "exampleUserId"; // Remplacez par l'utilisateur actuel
    const now = Timestamp.now();

    if (newStatus === "seen") {
      updateTicket(ticketId, { status: newStatus, seenAt: now, updatedBy });
    } else if (newStatus === "in_progress") {
      setCurrentTicket(ticketId); // Ouvre la modale pour demander des détails
    } else if (newStatus === "resolved") {
      updateTicket(ticketId, { status: newStatus, resolvedAt: now, updatedBy });
    }
  };

  const handleInProgress = () => {
    if (!currentTicket) return;
    const updatedBy = "exampleUserId"; // Remplacez par l'utilisateur actuel
    updateTicket(currentTicket, {
      status: "in_progress",
      deliveryNote,
      expectedDeliveryAt: expectedDeliveryAt ? Timestamp.fromDate(new Date(expectedDeliveryAt)) : undefined,
      updatedBy,
    });
    setCurrentTicket(null); // Ferme la modale
    setDeliveryNote("");
    setExpectedDeliveryAt("");
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    try {
      await deleteTicket(ticketToDelete);
      toast.success("Ticket supprimé avec succès !");
      setTicketToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du ticket :", error);
      toast.error("Erreur lors de la suppression du ticket.");
      setTicketToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulaire d'ajout dans une dialogue */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Ajouter un ticket</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nom de l'article"
              value={newTicket.item}
              onChange={(e) => setNewTicket({ ...newTicket, item: e.target.value })}
            />
            <Textarea
              placeholder="Note (optionnelle)"
              value={newTicket.note}
              onChange={(e) => setNewTicket({ ...newTicket, note: e.target.value })}
            />
            <Button onClick={createTicket}>Créer</Button>
          </div>
        </DialogContent>
      </Dialog>
    
      <Separator className="mb-4 dark:" />

      {/* Modale pour l'état "En cours" */}
      <Dialog open={!!currentTicket} onOpenChange={() => setCurrentTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des détails de livraison</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Remarque de livraison"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Date prévue"
              value={expectedDeliveryAt}
              onChange={(e) => setExpectedDeliveryAt(e.target.value)}
            />
            <Button onClick={handleInProgress}>Confirmer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale de confirmation de suppression */}
      <Dialog open={!!ticketToDelete} onOpenChange={() => setTicketToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setTicketToDelete(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteTicket}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Affichage des tickets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.keys(statuses).map((statusKey) => (
          <div key={statusKey} className="space-y-4">
            <h3 className="text-lg text-center font-bold">{statuses[statusKey as TicketStatus]}</h3>
            {isLoading ? (
              // Affichage des squelettes pendant le chargement
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-neutral-900 rounded-lg shadow space-y-2"
                >
                  <Skeleton className={`${getRandomHeight()} w-3/4`} />
                  <Skeleton className={`${getRandomHeight()} w-full`} />
                  <Skeleton className={`${getRandomHeight()} w-5/6`} />
                  <div className="mt-4 space-y-1">
                    <Skeleton className={`${getRandomHeight()} w-1/2`} />
                    <Skeleton className={`${getRandomHeight()} w-1/3`} />
                  </div>
                </div>
              ))
            ) : (
              // Affichage des tickets une fois chargés
              tickets
                .filter((ticket) => {
                  // Filtrer par statut
                  if (ticket.status !== statusKey) return false;

                  // Masquer les tickets résolus depuis plus de 30 jours
                  if (ticket.status === "resolved" && ticket.resolvedAt) {
                    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                    const resolvedDate = ticket.resolvedAt.toDate().getTime();
                    if (resolvedDate < thirtyDaysAgo) return false;
                  }

                  return true;
                })
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-neutral-700 space-y-2"
                  >
                    <h4 className="text-md font-bold">{ticket.item}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.note || "Pas de commentaire"}</p>
                    {ticket.deliveryNote && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Remarque :</strong> {ticket.deliveryNote}
                      </p>
                    )}
                    {ticket.expectedDeliveryAt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Livraison prévue :</strong>{" "}
                        {ticket.expectedDeliveryAt.toDate().toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-4 space-y-1">
                      <p className="text-xs text-gray-500">
                        <strong>Créé le :</strong> {ticket.createdAt.toDate().toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Créé par :</strong> {ticket.createdBy}
                      </p>
                      {ticket.seenAt && (
                        <p className="text-xs text-gray-500">
                          <strong>Vu le :</strong> {ticket.seenAt.toDate().toLocaleDateString()}
                        </p>
                      )}
                      {ticket.resolvedAt && (
                        <p className="text-xs text-gray-500">
                          <strong>Résolu le :</strong> {ticket.resolvedAt.toDate().toLocaleDateString()}
                        </p>
                      )}
                      {ticket.updatedBy && (
                        <p className="text-xs text-gray-500">
                          <strong>Mis à jour par :</strong> {ticket.updatedBy}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => updateTicketStatus(ticket.id, value as TicketStatus)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Changer l'état" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(statuses)
                            .filter((key) => {
                              // Empêcher de revenir à "nouveau" si le ticket a déjà été vu
                              if (key === "new" && ticket.status !== "new") return false;
                              return true;
                            })
                            .map((key) => (
                              <SelectItem key={key} value={key}>
                                <Badge className="w-full">{statuses[key as TicketStatus]}</Badge>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setTicketToDelete(ticket.id)}
                        title="Supprimer le ticket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}