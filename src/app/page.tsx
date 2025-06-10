"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { UserProfileModal } from "@/components/UserProfileModal";
import { InvitationCodeModal } from "@/components/InvitationCodeModal";
import { toast } from "sonner";

interface PendingUserData {
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  };
  role: string;
  inviteRef: import("firebase/firestore").DocumentReference;
  inviteSnap: import("firebase/firestore").DocumentData;
}

export default function Home() {
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<PendingUserData | null>(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingUserData["user"] | null>(null);

  const handleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        router.push("/dashboard");
      } else {
        setPendingGoogleUser(user);
        setShowCodeModal(true);
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      toast.error("Échec de connexion. Veuillez réessayer.");
    }
  };

  // Gestion de la soumission du code d'invitation
  const handleCodeSubmit = async (code: string) => {
    if (!pendingGoogleUser) return;
    setShowCodeModal(false);
    const inviteRef = doc(db, "invitations", code);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists() || inviteSnap.data().usedBy || inviteSnap.data().used) {
      toast.error("Code invalide ou déjà utilisé.");
      return;
    }

    setPendingUserData({
      user: pendingGoogleUser,
      role: inviteSnap.data().role,
      inviteRef,
      inviteSnap,
    });
    setShowProfileModal(true);
  };

  // Soumission du formulaire de profil
  const handleProfileSubmit = async (formData: {
    displayName: string;
    email: string;
    avatarUrl: string;
    phone: string;
    birthday: string;
    since: string;
  }) => {
    if (!pendingUserData) return;
    const { user, role, inviteRef, inviteSnap } = pendingUserData;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      displayName: formData.displayName,
      email: formData.email,
      avatarUrl: formData.avatarUrl,
      phone: formData.phone,
      birthday: formData.birthday,
      since: formData.since,
      role,
      isAdmin: role === "admin",
      createdAt: new Date(),
    });
    await setDoc(inviteRef, { ...inviteSnap.data(), usedBy: user.uid, used: true }, { merge: true });
    toast.success("Bienvenue ! Votre compte est activé.");
    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
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
      <InvitationCodeModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSubmit={handleCodeSubmit}
      />
      <UserProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
        initialData={pendingUserData ? {
          displayName: pendingUserData.user.displayName || "",
          email: pendingUserData.user.email || "",
          avatarUrl: pendingUserData.user.photoURL || "",
        } : { displayName: "", email: "", avatarUrl: "" }}
      />
    </div>
  );
}