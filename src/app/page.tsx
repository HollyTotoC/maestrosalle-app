"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "@/lib/firebase/client";
import { useUserStore } from "@/store/useUserStore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase"; // adapte le chemin si besoin

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
      const result = await loginWithGoogle();
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Utilisateur déjà enregistré, accès direct
        router.push("/dashboard");
      } else {
        // Demander le code d’invitation
        const code = prompt("Entrez votre code d'invitation :");
        if (!code) return;

        // Vérifier le code dans Firestore
        const inviteRef = doc(db, "invitations", code);
        const inviteSnap = await getDoc(inviteRef);

        if (code === "666") {
          // Création d'un admin sans passer par la collection invitations
          await setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.photoURL,
            role: "admin",
            createdAt: new Date(),
          });
          alert("Bienvenue admin !");
          router.push("/dashboard");
          return;
        }

        if (!inviteSnap.exists() || inviteSnap.data().used) {
          alert("Code invalide ou déjà utilisé.");
          return;
        }

        // Créer le user avec les infos du code
        const { role } = inviteSnap.data();
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.photoURL,
          role,
          createdAt: new Date(),
        });

        // Marquer le code comme utilisé
        await setDoc(inviteRef, { ...inviteSnap.data(), used: true }, { merge: true });

        alert("Bienvenue ! Votre compte est activé.");
        router.push("/dashboard");
      }
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