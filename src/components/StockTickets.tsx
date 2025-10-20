"use client";

import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTicketStore } from "@/store/useTicketStore";
import { useAppStore } from "@/store/store";
import { useUserStore } from "@/store/useUserStore";
import { useUsersStore } from "@/store/useUsersStore";
import { Skeleton } from "./ui/skeleton";
import { Ticket, TicketStatus } from "@/types/ticket";
import { Separator } from "./ui/separator";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { listenToUsers } from "@/lib/firebase/server";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faEye, faTruck, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
// Plus besoin de @dnd-kit, on fait du drag & drop natif !


const statuses: Record<TicketStatus, string> = {
    new: "Nouveau",
    seen: "Vu",
    in_progress: "En cours",
    resolved: "Résolu",
  };

const statusIcons: Record<TicketStatus, React.ReactNode> = {
  new: <FontAwesomeIcon icon={faCirclePlus} className="text-blue-500" />,
  seen: <FontAwesomeIcon icon={faEye} className="text-amber-500" />,
  in_progress: <FontAwesomeIcon icon={faTruck} className="text-purple-500" />,
  resolved: <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />,
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
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
  const currentUserId = useUserStore((state) => state.userId);
  const usersRecord = useUsersStore((state) => state.users);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ item: "", note: "" });
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [expectedDeliveryAt, setExpectedDeliveryAt] = useState("");
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);

  // Sync tickets
  useEffect(() => {
    if (!selectedRestaurant?.id) return;

    const unsubscribe = listenToTickets(selectedRestaurant.id, (tickets) => {
      useTicketStore.getState().setTickets(tickets);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedRestaurant?.id]);

  // Sync users (pour afficher les noms)
  useEffect(() => {
    const unsubscribe = listenToUsers((users) => {
      useUsersStore.getState().setUsers(users);
    });

    return () => unsubscribe();
  }, []);

  // Fonction helper pour récupérer le nom d'un utilisateur
  const getUserName = (userId: string) => {
    const user = usersRecord[userId];
    return user?.displayName || user?.email || "Utilisateur inconnu";
  };

  const createTicket = async () => {
    if (!newTicket.item.trim()) {
      toast.error("Le champ 'item' est obligatoire.");
      return;
    }

    // Debug logs
    console.log("Debug createTicket:", {
      selectedRestaurant,
      currentUserId,
      hasRestaurantId: !!selectedRestaurant?.id,
      hasUserId: !!currentUserId
    });

    if (!selectedRestaurant?.id) {
      toast.error("Erreur: Aucun restaurant sélectionné. Veuillez sélectionner un restaurant.");
      return;
    }

    if (!currentUserId) {
      toast.error("Erreur: Utilisateur non connecté. Veuillez vous reconnecter.");
      return;
    }

    try {
      const createdAt = Timestamp.now();

      await addTicket({
        ...newTicket,
        restaurantId: selectedRestaurant.id,
        createdBy: currentUserId,
        createdAt,
        status: "new"
      });

      // Reset form et fermeture dialog
      setNewTicket({ item: "", note: "" });
      setIsAddDialogOpen(false);
      toast.success("Ticket créé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création du ticket :", error);
      toast.error(`Erreur lors de la création du ticket: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const updateTicketStatus = (ticketId: string, newStatus: "new" | "seen" | "in_progress" | "resolved") => {
    if (!currentUserId) {
      toast.error("Erreur: utilisateur non défini.");
      return;
    }

    const now = Timestamp.now();

    if (newStatus === "seen") {
      updateTicket(ticketId, { status: newStatus, seenAt: now, updatedBy: currentUserId });
    } else if (newStatus === "in_progress") {
      setCurrentTicket(ticketId);
    } else if (newStatus === "resolved") {
      updateTicket(ticketId, { status: newStatus, resolvedAt: now, updatedBy: currentUserId });
    }
  };

  const handleInProgress = () => {
    if (!currentTicket || !currentUserId) return;

    // Le statut est déjà "in_progress", on ajoute juste les détails
    updateTicket(currentTicket, {
      deliveryNote,
      expectedDeliveryAt: expectedDeliveryAt ? Timestamp.fromDate(new Date(expectedDeliveryAt)) : undefined,
      updatedBy: currentUserId,
    });
    setCurrentTicket(null);
    setDeliveryNote("");
    setExpectedDeliveryAt("");
    toast.success("Détails de livraison ajoutés");
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

  // Handlers pour le drag & drop natif (desktop)
  const handleDragStart = (ticketId: string) => {
    setDraggedTicketId(ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Nécessaire pour permettre le drop
  };

  const handleDrop = (newStatus: TicketStatus) => {
    if (!draggedTicketId || !currentUserId) return;

    const ticket = tickets.find((t) => t.id === draggedTicketId);
    if (!ticket || ticket.status === newStatus) {
      setDraggedTicketId(null);
      return;
    }

    // Empêcher de revenir à "nouveau" si le ticket a déjà été vu
    if (newStatus === "new" && ticket.status !== "new") {
      toast.error("Impossible de remettre le ticket à 'Nouveau'");
      setDraggedTicketId(null);
      return;
    }

    const now = Timestamp.now();

    // Gestion des différents statuts
    if (newStatus === "seen") {
      updateTicket(draggedTicketId, { status: newStatus, seenAt: now, updatedBy: currentUserId });
      toast.success("Ticket marqué comme 'Vu'");
    } else if (newStatus === "in_progress") {
      updateTicket(draggedTicketId, { status: newStatus, updatedBy: currentUserId });
      toast.success("Ticket en cours - Ajoutez les détails de livraison");
      setCurrentTicket(draggedTicketId);
    } else if (newStatus === "resolved") {
      updateTicket(draggedTicketId, { status: newStatus, resolvedAt: now, updatedBy: currentUserId });
      toast.success("Ticket marqué comme 'Résolu'");
    } else {
      updateTicket(draggedTicketId, { status: newStatus, updatedBy: currentUserId });
    }

    setDraggedTicketId(null);
  };

  // Handlers pour le touch (mobile)
  const handleTouchStart = (e: React.TouchEvent, ticketId: string) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedTicketId(ticketId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedTicketId) return;
    // Empêcher le scroll pendant le drag
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedTicketId || !touchStartPos) {
      setDraggedTicketId(null);
      setTouchStartPos(null);
      return;
    }

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    // Trouver la zone de drop la plus proche
    const dropZone = element?.closest('[data-drop-zone]') as HTMLElement;
    if (dropZone) {
      const newStatus = dropZone.getAttribute('data-drop-zone') as TicketStatus;
      handleDrop(newStatus);
    }

    setDraggedTicketId(null);
    setTouchStartPos(null);
  };

  return (
    <div className="space-y-4">
        {/* Formulaire d'ajout dans une dialogue */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button>Ajouter un ticket</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Article *</label>
              <Input
                placeholder="Ex: Huile d'olive"
                value={newTicket.item}
                onChange={(e) => setNewTicket({ ...newTicket, item: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTicket.item.trim()) {
                    createTicket();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note (optionnelle)</label>
              <Textarea
                placeholder="Ex: 2 bouteilles 1L"
                value={newTicket.note}
                onChange={(e) => setNewTicket({ ...newTicket, note: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setNewTicket({ item: "", note: "" });
                  setIsAddDialogOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button onClick={createTicket} disabled={!newTicket.item.trim()}>
                Créer
              </Button>
            </div>
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
            <h3 className="text-lg text-center font-bold flex items-center justify-center gap-2">
              {statusIcons[statusKey as TicketStatus]}
              {statuses[statusKey as TicketStatus]}
            </h3>
            <div
              data-drop-zone={statusKey}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(statusKey as TicketStatus)}
              className={`space-y-4 min-h-[200px] p-2 rounded-lg transition-all duration-200 ${
                draggedTicketId
                  ? 'bg-primary/10 dark:bg-primary/20 border-2 border-dashed border-primary'
                  : 'bg-transparent border-2 border-transparent'
              }`}
            >
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
                    draggable
                    onDragStart={() => handleDragStart(ticket.id)}
                    onTouchStart={(e) => handleTouchStart(e, ticket.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-neutral-700 space-y-2 cursor-move touch-none ${
                      draggedTicketId === ticket.id ? 'opacity-50' : 'opacity-100'
                    }`}
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Créé le :</strong> {ticket.createdAt.toDate().toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Créé par :</strong> {getUserName(ticket.createdBy)}
                      </p>
                      {ticket.seenAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>Vu le :</strong> {ticket.seenAt.toDate().toLocaleDateString()}
                        </p>
                      )}
                      {ticket.resolvedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>Résolu le :</strong> {ticket.resolvedAt.toDate().toLocaleDateString()}
                        </p>
                      )}
                      {ticket.updatedBy && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>Mis à jour par :</strong> {getUserName(ticket.updatedBy)}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTicketToDelete(ticket.id);
                        }}
                        title="Supprimer le ticket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}