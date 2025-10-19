// Page dédiée à l'outil de génération de codes d'invitation
"use client";

import InvitationTool from "@/components/InvitationTool";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useAppStore } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faLock } from "@fortawesome/free-solid-svg-icons";

export default function InvitationToolPage() {
    const hasHydrated = useAppStore((state) => state.hasHydrated);
    const { canAccessInvitations } = usePermissions();

    if (!hasHydrated) return null; // Avoid UI flicker

    // Restriction d'accès : seulement admin et manager
    if (!canAccessInvitations) {
        return (
            <>
                <Navbar />
                <main className="max-w-4xl mx-auto p-4 md:p-6">
                    <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
                        <div className="text-center py-12">
                            <FontAwesomeIcon icon={faLock} className="text-muted-foreground text-6xl mb-4" />
                            <h2 className="text-2xl font-bold text-foreground mb-2">Accès restreint</h2>
                            <p className="text-muted-foreground">
                                Vous n&apos;avez pas les permissions nécessaires pour accéder à cet outil.
                            </p>
                            <p className="text-muted-foreground text-sm mt-2">
                                Seuls les administrateurs et managers peuvent générer des codes d&apos;invitation.
                            </p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto p-4 md:p-6">
                {/* Container glassmorphism - Mini-App wrapper */}
                <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                            <FontAwesomeIcon icon={faTicket} className="text-primary" />
                            Générer un code d&apos;invitation
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Créez des codes d&apos;invitation à usage unique pour ajouter de nouveaux membres à l&apos;équipe
                        </p>
                    </div>
                    <Card className="bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                        <InvitationTool />
                    </Card>
                </div>
            </main>
        </>
    );
}
