"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import Step1 from "@/components/cloture/Step1";
import Step2 from "@/components/cloture/Step2";
import Step3 from "@/components/cloture/Step3";
import { Progress } from "@/components/ui/progress";

export default function Cloture() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-4 flex flex-col gap-6 grow">
        <h1 className="text-3xl font-bold">Clôture de caisse</h1>
        <Progress value={(step / 3) * 100} className="w-full" />
        <div className="mt-6">
          {step === 1 && <Step1 nextStep={nextStep} />}
          {step === 2 && <Step2 nextStep={nextStep} prevStep={prevStep} />}
          {step === 3 && <Step3 prevStep={prevStep} />}
        </div>
      </main>
    </div>
  );
}