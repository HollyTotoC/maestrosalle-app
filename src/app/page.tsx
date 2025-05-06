"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginWithGoogle, getCurrentUser } from "@/lib/firebase/client";
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

      if (!user) {
        throw new Error("Utilisateur non récupéré après la connexion.");
      }

      useUserStore.setState({
        userId: user.uid,
        role: "serveur", // Exemple de rôle
        restaurantId: "123", // Exemple d'ID de restaurant
        avatarUrl: user.photoURL,
        displayName: user.displayName,
      });

      router.push("/dashboard"); // Redirige après connexion
    } catch (error) {
        console.error("Login error:", error);
        alert("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
      }
    }

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
