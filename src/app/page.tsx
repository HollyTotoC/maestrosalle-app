"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "@/lib/firebase/client";
import { useUserStore } from "@/store/useUserStore";

export default function Home() {
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    if (userId) {
      router.push("/dashboard");
    }
  }, [userId, router]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Erreur de connexion :", error);
      alert("Échec de connexion. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 p-24">
      <h1 className="text-3xl">Bienvenue sur MaestroSalle !</h1>
      <p className="text-lg">
        MaestroSalle est une application de gestion de restaurant pour fluidifier la gestion de la salle.
      </p>
      <div className="mt-4">
        <Button onClick={handleLogin}>Login avec Google</Button>
      </div>
    </div>
  );
}