"use client";

import { FormData, ClosureData } from "@/types/cloture";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import Step1 from "@/components/cloture/Step1";
import Step2 from "@/components/cloture/Step2";
import Step3 from "@/components/cloture/Step3";
import Step4 from "@/components/cloture/Step4";
import Step5 from "@/components/cloture/Step5";
import Step6 from "@/components/cloture/Step6";
import Step7 from "@/components/cloture/Step7";
import ClotureFormLayout from "@/components/cloture/ClotureFormLayout";
import ResumeCard from "@/components/cloture/ResumeCard";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { saveClosureData } from "@/lib/firebase/server";
import { useAppStore } from "@/store/store";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faRotate } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const DRAFT_KEY_PREFIX = "cloture-draft-";
const TOTAL_STEPS = 7;

export default function Cloture() {
    const router = useRouter();
    const hasHydrated = useAppStore((state) => state.hasHydrated);
    const restaurantId = useAppStore((state) => state.selectedRestaurant?.id ?? "defaultRestaurantId");

    const [step, setStep] = useState(1);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
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

    const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    const prevStep = () => {
        if (step === 1) {
            router.push("/dashboard");
        } else {
            setStep((prev) => Math.max(prev - 1, 1));
        }
    };
    const goToStep = (targetStep: number) => {
        if (targetStep >= 1 && targetStep <= TOTAL_STEPS) {
            setStep(targetStep);
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

    const handleResetForm = () => {
        const draftKey = `${DRAFT_KEY_PREFIX}${restaurantId}`;
        localStorage.removeItem(draftKey);
        setFormData({
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
        });
        setStep(1);
        setIsResetDialogOpen(false);
        toast.success("Formulaire réinitialisé");
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-4 grow">
                {/* Container glassmorphism - Mini-App wrapper */}
                <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                                <FontAwesomeIcon icon={faCashRegister} className="text-primary" />
                                Clôture de caisse
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Processus optimisé en 7 étapes pour réconcilier vos flux de caisse et CB du jour
                            </p>
                        </div>
                        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faRotate} />
                                    Reset
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Réinitialiser le formulaire ?</DialogTitle>
                                    <DialogDescription>
                                        Cette action est irréversible. Toutes les données saisies seront définitivement perdues et le brouillon sauvegardé sera supprimé.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Annuler</Button>
                                    </DialogClose>
                                    <Button onClick={handleResetForm} variant="destructive">
                                        Réinitialiser
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Progress
                        value={(step / TOTAL_STEPS) * 100}
                        className="mx-auto w-full max-w-md mb-6"
                    />

                    {/* Layout avec sidebar/bottom résumé */}
                    <ClotureFormLayout
                        currentStep={step}
                        totalSteps={TOTAL_STEPS}
                        formData={formData}
                        resumeCard={<ResumeCard formData={formData} currentStep={step} onStepChange={goToStep} />}
                    >
                        {/* Steps */}
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
                                prevStep={prevStep}
                                formData={formData}
                                onSave={(closureData: ClosureData) =>
                                    handleSave(closureData)
                                }
                            />
                        )}
                    </ClotureFormLayout>
                </div>
            </main>
        </div>
    );
}
