// Correction : rendre la page /dispos/page.tsx client-side pour permettre le passage de props interactives
"use client";
import React from "react";
import DisposForm from "@/components/dispos/DisposForm";
import Navbar from "@/components/Navbar";
import { useAppStore } from "@/store/store";
import { useUserStore } from "@/store/useUserStore";
import { saveUserDispos } from "@/lib/firebase/server";
import { toast } from "sonner";
import type { UserDispos, DispoRole } from "@/types/dispos";

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
    async function handleDisposSubmit(data: UserDispos) {
        console.log("%c[page.tsx] #1 handleDisposSubmit called", "color: #0984e3; font-weight: bold", data);
        if (!userId) {
            toast.error("Utilisateur non connecté");
            return;
        }
        // Calcule le lundi et dimanche de la semaine sélectionnée
        const semaineStart = new Date(Object.keys(data.disponibilites)[0]);
        const semaineEnd = new Date(Object.keys(data.disponibilites)[6]);
        console.log("%c[page.tsx] #2 semaineStart/semaineEnd", "color: #0984e3; font-weight: bold", { semaineStart, semaineEnd });
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

    return (
        <>
            <Navbar />
            <main className="max-w-2xl mx-auto p-4">
                <DisposForm onSubmit={handleDisposSubmit} />
            </main>
        </>
    );
}
