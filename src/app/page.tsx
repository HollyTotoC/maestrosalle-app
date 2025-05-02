"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginWithGoogle, getCurrentUser } from "@/lib/firebase";
import { useUserStore } from "@/store/useUserStore";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push("/dashboard"); // Redirige vers le tableau de bord si l'utilisateur est connecté
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      useUserStore.setState({
        userId: user.uid,
        role: "serveur", // Example role
        restaurantId: "123", // Example restaurant ID
        avatarUrl: user.photoURL,
        displayName: user.displayName,
      });
      router.push("/dashboard"); // Redirige après connexion
    } catch (error) {
      console.error("Login error:", error);
      alert("Erreur lors de la connexion.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 p-24">
      <h1 className="text-3xl">Bienvenue sur MaestroSalle !</h1>
      <p className="text-lg">
        MaestroSalle est une application de gestion de restaurant pour fluidifier la gestion de la salle.
      </p>
      <div className="mt-4">
        <Button onClick={handleLogin}>Login</Button>
      </div>
    </div>
  );
}
