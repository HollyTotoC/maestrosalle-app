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
import { SectionSeparatorStack } from "@/components/SectionSeparatorStack";

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
        console.log("%c[page.tsx] #1 handleDisposSubmit called", "color: #0984e3; font-weight: bold", data);
        if (!userId) {
            toast.error("Utilisateur non connecté");
            return;
        }
        // Utilise explicitement les bornes de semaine transmises par le formulaire
        const semaineStart = data.semaineStart ? new Date(data.semaineStart) : new Date(Object.keys(data.disponibilites)[0]);
        const semaineEnd = data.semaineEnd ? new Date(data.semaineEnd) : new Date(Object.keys(data.disponibilites)[6]);
        console.log("%c[page.tsx] #2 semaineStart/semaineEnd (depuis props)", "color: #0984e3; font-weight: bold", { semaineStart, semaineEnd });
        const userRole: DispoRole = mapRoleToDispoRole(role);
        try {
            console.log("%c[page.tsx] #3 calling saveUserDispos", "color: #0984e3; font-weight: bold", { semaineStart, semaineEnd, userId, data: { ...data, role: userRole } });
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
        } catch (err) {
            console.log("%c[page.tsx] #4 error", "color: #d63031; font-weight: bold", err);
            toast.error("Erreur lors de l'enregistrement");
        }
    }

    // Affichage conditionnel : manager/owner/admin
    const isManager = ["manager", "owner"].includes(role || "") || useUserStore.getState().isAdmin;

    return (
        <>
            <Navbar />
            <main className="max-w-5xl mx-auto gap-4 p-4">
                {isManager ? (
                    <>
                        <DisposManagerTable />
                        <SectionSeparatorStack />
                        <DisposForm onSubmit={handleDisposSubmit} />
                    </>
                ) : (
                    <DisposForm onSubmit={handleDisposSubmit} />
                )}
            </main>
        </>
    );
}
