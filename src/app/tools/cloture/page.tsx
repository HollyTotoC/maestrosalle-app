"use client";

import { FormData, ClosureData } from "@/types/cloture"; // Import des types
import Navbar from "@/components/Navbar";
import { useState } from "react";
import Step1 from "@/components/cloture/Step1";
import Step2 from "@/components/cloture/Step2";
import Step3 from "@/components/cloture/Step3";
import Step4 from "@/components/cloture/Step4";
import Step5 from "@/components/cloture/Step5";
import Step6 from "@/components/cloture/Step6";
import Step7 from "@/components/cloture/Step7";
import Step8 from "@/components/cloture/Step8";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { saveClosureData } from "@/lib/firebase/server";
import { useAppStore } from "@/store/store";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister } from "@fortawesome/free-solid-svg-icons";

const DRAFT_KEY_PREFIX = "cloture-draft-";

export default function Cloture() {
    const router = useRouter();
    const hasHydrated = useAppStore((state) => state.hasHydrated);
    const restaurantId = useAppStore((state) => state.selectedRestaurant?.id ?? "defaultRestaurantId");

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(() => {
        // Charger le draft depuis localStorage au démarrage
        if (typeof window !== 'undefined') {
            const draftKey = `${DRAFT_KEY_PREFIX}${restaurantId}`;
            const savedDraft = localStorage.getItem(draftKey);

            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    toast.info("Brouillon restauré. Vous pouvez reprendre où vous en étiez.");
                    return parsed;
                } catch {
                    // Erreur silencieuse, on utilise l'état par défaut
                }
            }
        }

        // État initial par défaut
        return {
            date: undefined,
            cashCounted: undefined,
            tpeAmounts: [],
            cbZelty: undefined,
            cashZelty: undefined,
            cashOutZelty: undefined,
            extraFlowEntries: [],
            previousCash: undefined,
            cashToKeep: undefined,
            cashToSafe: undefined,
            tpeDiscrepancy: undefined,
            cashDiscrepancy: undefined,
            cbStatus: undefined,
            cashStatus: undefined,
        };
    });

    if (!hasHydrated) return null; // Avoid UI flicker

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 8));
    const prevStep = () => {
        if (step === 1) {
            router.push("/dashboard");
        } else {
            setStep((prev) => Math.max(prev - 1, 1));
        }
    };

    const handleSave = async (closureData: ClosureData) => {
        if (!closureData.date) {
            toast.error("La date est manquante. Veuillez vérifier les données.");
            return;
        }

        try {
            await saveClosureData({ ...closureData, restaurantId: restaurantId });

            // ✅ Nettoyer le brouillon après succès
            const draftKey = `${DRAFT_KEY_PREFIX}${restaurantId}`;
            localStorage.removeItem(draftKey);

            toast.success("Clôture enregistrée avec succès !");
            router.push("/dashboard");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des données :", error);
            toast.error("Erreur lors de la sauvegarde des données.");
        }
    };

    const updateFormData = (data: Partial<FormData>) => {
        setFormData((prev) => {
            const updatedData = { ...prev, ...data };

            // 💾 Sauvegarder automatiquement dans localStorage
            const draftKey = `${DRAFT_KEY_PREFIX}${restaurantId}`;
            localStorage.setItem(draftKey, JSON.stringify(updatedData));

            return updatedData;
        });
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="max-w-4xl mx-auto p-4 flex flex-col gap-4 grow">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon={faCashRegister} />
                        Clôture de caisse
                    </h1>
                    <p className="text-muted-foreground">
                        Processus en 8 étapes pour réconcilier vos flux de caisse et CB du jour
                    </p>
                </div>
                <Progress
                    value={(step / 8) * 100}
                    className="mx-auto w-full max-w-md"
                />
                <div className="">
                    {step === 1 && (
                        <Step1
                            nextStep={nextStep}
                            prevStep={prevStep}
                            formData={formData}
                            setFormData={updateFormData}
                        />
                    )}
                    {step === 2 && (
                        <Step2
                            nextStep={nextStep}
                            prevStep={prevStep}
                            formData={formData}
                            setFormData={updateFormData}
                        />
                    )}
                    {step === 3 && (
                        <Step3
                            nextStep={nextStep}
                            prevStep={prevStep}
                            formData={formData}
                            setFormData={updateFormData}
                        />
                    )}
                    {step === 4 && (
                        <Step4
                            nextStep={nextStep}
                            prevStep={prevStep}
                            formData={formData}
                            setFormData={updateFormData}
                        />
                    )}
                    {step === 5 && (
                        <Step5
                            nextStep={nextStep}
                            prevStep={prevStep}
                            formData={formData}
                            setFormData={updateFormData}
                        />
                    )}
                    {step === 6 && (
                        <Step6
                            nextStep={nextStep}
                            prevStep={prevStep}
                            formData={formData}
                            setFormData={updateFormData}
                        />
                    )}
                    {step === 7 && (
                        <Step7
                            nextStep={nextStep}
                            prevStep={prevStep}
                            formData={formData}
                            setFormData={updateFormData}
                        />
                    )}
                    {step === 8 && (
                        <Step8
                            prevStep={prevStep}
                            formData={formData}
                            onSave={(closureData: ClosureData) =>
                                handleSave(closureData)
                            }
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
