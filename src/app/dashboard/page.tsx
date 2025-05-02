"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/firebase";

export default function Dashboard() {
  const handleLogout = async () => {
    try {
      await logout();
      alert("Vous êtes déconnecté.");
      window.location.href = "/"; // Redirige vers la page d'accueil
    } catch (error) {
      console.error("Logout error:", error);
      alert("Erreur lors de la déconnexion.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 p-24">
      <h1 className="text-3xl">Tableau de bord</h1>
      <p className="text-lg">Bienvenue dans votre tableau de bord MaestroSalle.</p>
      <div className="mt-4">
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}