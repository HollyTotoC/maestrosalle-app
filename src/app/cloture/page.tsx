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

export default function Cloture() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
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

    const router = useRouter();

    const restaurantId = useAppStore((state) => state.selectedRestaurant?.id ?? "defaultRestaurantId");

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 8));
    const prevStep = () => {
        if (step === 1) {
            router.push("/dashboard");
        } else {
            setStep((prev) => Math.max(prev - 1, 1));
        }
    };

    const handleSave = async (closureData: ClosureData) => {
        console.log("Données de clôture :", closureData);
        if (!closureData.date) {
            alert("La date est manquante. Veuillez vérifier les données.");
            return;
        }

        try {
            console.log("Enregistrement des données dans Firestore...");
            await saveClosureData({ ...closureData, restaurantId: restaurantId });
            console.log("Données sauvegardées avec succès !");
            router.push("/dashboard");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des données :", error);
            alert("Erreur lors de la sauvegarde des données.");
        }
    };

    const updateFormData = (data: Partial<FormData>) => {
        setFormData((prev) => {
            const updatedData = { ...prev, ...data };
            console.table({ Step: step, ...updatedData });
            return updatedData;
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="p-4 flex flex-col gap-6 grow">
                <h1 className="text-3xl font-bold">Clôture de caisse</h1>
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
