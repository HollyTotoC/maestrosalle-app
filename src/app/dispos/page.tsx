// Correction : rendre la page /dispos/page.tsx client-side pour permettre le passage de props interactives
"use client";
import React from "react";
import DisposForm from "@/components/dispos/DisposForm";
import DisposManagerTable from "@/components/dispos/DisposManagerTable";
import Navbar from "@/components/Navbar";
import { useAppStore } from "@/store/store";
import { useUserStore } from "@/store/useUserStore";
import { saveUserDispos } from "@/lib/firebase/server";
import { toast } from "sonner";
import type { UserDispos, DispoRole } from "@/types/dispos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarWeek } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DisposPage() {
    const hasHydrated = useAppStore((state) => state.hasHydrated);
    const userId = useUserStore((state) => state.userId);
    const role = useUserStore((state) => state.role);

    if (!hasHydrated) return null;

    // Mapping explicite du rôle userStore vers DispoRole
    function mapRoleToDispoRole(role: string | null): DispoRole {
        if (role && role.toLowerCase() === "extra") return "extra";
        return "CDI";
    }

    // Handler pour la soumission du formulaire
    async function handleDisposSubmit(data: UserDispos & { semaineStart?: Date; semaineEnd?: Date }) {
        if (!userId) {
            toast.error("Utilisateur non connecté");
            return;
        }
        // Utilise explicitement les bornes de semaine transmises par le formulaire
        const semaineStart = data.semaineStart ? new Date(data.semaineStart) : new Date(Object.keys(data.disponibilites)[0]);
        const semaineEnd = data.semaineEnd ? new Date(data.semaineEnd) : new Date(Object.keys(data.disponibilites)[6]);
        const userRole: DispoRole = mapRoleToDispoRole(role);
        try {
            await saveUserDispos({
                semaineStart,
                semaineEnd,
                userId,
                data: {
                    ...data,
                    role: userRole,
                },
            });
            toast.success("Disponibilités enregistrées !");
        } catch {
            toast.error("Erreur lors de l'enregistrement");
        }
    }

    // Affichage conditionnel : manager/owner/admin
    const isManager = ["manager", "owner"].includes(role || "") || useUserStore.getState().isAdmin;

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto p-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarWeek} />
                        Planning des Disponibilités
                    </h1>
                    <p className="text-muted-foreground">
                        Indiquez vos disponibilités hebdomadaires pour faciliter la planification des services
                    </p>
                </div>

                {isManager ? (
                    /* Managers/Admins : Tabs avec Planning (par défaut) et Dispos */
                    <Tabs defaultValue="planning" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="planning">Planning</TabsTrigger>
                            <TabsTrigger value="dispos">Mes Dispos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="planning" className="space-y-4">
                            <DisposManagerTable />
                        </TabsContent>
                        <TabsContent value="dispos" className="space-y-4">
                            <DisposForm onSubmit={handleDisposSubmit} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    /* CDI/Extra : Directement le formulaire, pas de tab Planning */
                    <DisposForm onSubmit={handleDisposSubmit} />
                )}
            </main>
        </>
    );
}
