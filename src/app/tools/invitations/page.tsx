// Page dédiée à l’outil de génération de codes d’invitation
"use client";

import InvitationTool from "@/components/InvitationTool";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useAppStore } from "@/store/store";

export default function InvitationToolPage() {
    const hasHydrated = useAppStore((state) => state.hasHydrated);

    if (!hasHydrated) return null; // Avoid UI flicker
    return (
        <>
            <Navbar />
            <div className="max-w-3xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">
                    Générer un code d&apos;invitation
                </h1>
                <Card className="mb-4">
                    <InvitationTool />
                </Card>
            </div>
        </>
    );
}
