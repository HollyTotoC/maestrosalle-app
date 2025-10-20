"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { UserProfileModal } from "@/components/UserProfileModal";
import { InvitationCodeModal } from "@/components/InvitationCodeModal";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPizzaSlice,
  faGauge,
  faCashRegister,
  faUsers,
  faChartLine,
  faShieldAlt,
  faRightToBracket,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<PendingUserData | null>(null);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingUserData["user"] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
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
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      toast.error("Échec de connexion. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (code: string) => {
    if (!pendingGoogleUser) return;

    setIsValidatingCode(true);
    try {
      const inviteRef = doc(db, "invitations", code);
      const inviteSnap = await getDoc(inviteRef);

      if (!inviteSnap.exists() || inviteSnap.data().usedBy || inviteSnap.data().used) {
        toast.error("Code invalide ou déjà utilisé.");
        setIsValidatingCode(false);
        return;
      }

      setPendingUserData({
        user: pendingGoogleUser,
        role: inviteSnap.data().role,
        inviteRef,
        inviteSnap,
      });
      setShowCodeModal(false);
      setShowProfileModal(true);
      setIsValidatingCode(false);
    } catch (error) {
      console.error("Erreur de validation du code :", error);
      toast.error("Erreur lors de la validation du code.");
      setIsValidatingCode(false);
    }
  };

  const handleProfileSubmit = async (formData: {
    displayName: string;
    email: string;
    avatarUrl: string;
    phone: string;
    birthday: string;
    since: string;
  }) => {
    if (!pendingUserData) return;

    setIsCreatingAccount(true);
    try {
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
      setIsCreatingAccount(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
    } catch (error) {
      console.error("Erreur de création du compte :", error);
      toast.error("Erreur lors de la création du compte.");
      setIsCreatingAccount(false);
    }
  };

  if (!mounted) return null;

  const features = [
    { icon: faGauge, title: "Dashboard", desc: "Vue d'ensemble temps réel" },
    { icon: faCashRegister, title: "Clôtures", desc: "Gestion des caisses" },
    { icon: faUsers, title: "Équipe", desc: "Coordination simplifiée" },
    { icon: faChartLine, title: "Analytics", desc: "Statistiques détaillées" },
  ];

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/10 dark:from-background dark:via-background dark:to-background">
      {/* Background Effects - Different for Light/Dark - Mobile optimized */}
      {theme === "light" ? (
        <>
          {/* Light Mode: Floating orbs - Responsive sizes */}
          <div className="absolute top-5 left-5 md:top-10 md:left-10 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-5 right-5 md:bottom-10 md:right-10 w-64 h-64 md:w-[600px] md:h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 md:w-[800px] md:h-[800px] bg-accent/5 rounded-full blur-3xl animate-spin-slow" />
        </>
      ) : (
        <>
          {/* Dark Mode: Terminal grid - Mobile friendly */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[linear-gradient(to_right,oklch(0.8940_0.0873_200.2091)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.8940_0.0873_200.2091)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px]" />
          </div>
          {/* Scanline */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] opacity-20 pointer-events-none animate-scan" />
          {/* Corner brackets - Responsive position and size */}
          <div className="absolute top-4 left-4 md:top-20 md:left-20 w-16 h-16 md:w-32 md:h-32 border-t-2 border-l-2 border-primary/20" />
          <div className="absolute top-4 right-4 md:top-20 md:right-20 w-16 h-16 md:w-32 md:h-32 border-t-2 border-r-2 border-primary/20" />
          <div className="absolute bottom-4 left-4 md:bottom-20 md:left-20 w-16 h-16 md:w-32 md:h-32 border-b-2 border-l-2 border-primary/20" />
          <div className="absolute bottom-4 right-4 md:bottom-20 md:right-20 w-16 h-16 md:w-32 md:h-32 border-b-2 border-r-2 border-primary/20" />
        </>
      )}

      {/* Main Content - Mobile no-scroll, desktop normal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-5xl w-full space-y-4 sm:space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-3 sm:space-y-6">
            {/* Logo/Icon - Click to toggle theme - Compact mobile */}
            <div className="flex justify-center mb-3 sm:mb-8">
              {theme === "light" ? (
                <button
                  onClick={toggleTheme}
                  className="relative cursor-pointer group transition-transform hover:scale-110 active:scale-95"
                  aria-label="Basculer le thème"
                >
                  <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-2xl animate-pulse" />
                  <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-xl border-2 border-primary/30 flex items-center justify-center shadow-2xl group-hover:border-primary/50 transition-colors">
                    <FontAwesomeIcon icon={faPizzaSlice} className="text-3xl sm:text-5xl text-primary animate-bounce-slow" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={toggleTheme}
                  className="border-2 border-primary/50 bg-primary/5 p-3 sm:p-6 cursor-pointer hover:border-primary transition-colors group"
                  aria-label="Basculer le thème"
                >
                  <FontAwesomeIcon icon={faPizzaSlice} className="text-4xl sm:text-6xl text-primary animate-pulse group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>

            {/* Title - Compact mobile */}
            {theme === "light" ? (
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                MaestroSalle
              </h1>
            ) : (
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-mono font-black text-primary tracking-wider">
                &gt; MAESTRO_SALLE.sys
              </h1>
            )}

            {/* Subtitle - Compact mobile */}
            {theme === "light" ? (
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
                L&apos;application de gestion de restaurant qui transforme votre service
              </p>
            ) : (
              <div className="font-mono text-xs sm:text-sm md:text-base text-primary/80 max-w-2xl mx-auto bg-primary/5 border border-primary/30 p-2 sm:p-4">
                <div className="mb-1">
                  <span className="text-primary">$</span> maestro --info
                </div>
                <div className="text-primary/60 text-xs sm:text-sm">System: Restaurant Mgmt v2.0</div>
                <div className="text-primary/60 text-xs sm:text-sm">Status: READY</div>
                <div className="mt-1 sm:mt-2">
                  <span className="text-primary animate-pulse">_</span>
                </div>
              </div>
            )}

            {/* CTA Button - Compact mobile */}
            <div className="pt-4 sm:pt-8">
              {theme === "light" ? (
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  size="lg"
                  className="group px-6 sm:px-12 py-3 sm:py-7 text-sm sm:text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <FontAwesomeIcon
                    icon={isLoading ? faSpinner : faRightToBracket}
                    className={`mr-2 sm:mr-3 ${isLoading ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform text-sm sm:text-base`}
                  />
                  <span className="hidden sm:inline">{isLoading ? "Connexion en cours..." : "Connexion avec Google"}</span>
                  <span className="sm:hidden">{isLoading ? "Chargement..." : "Connexion"}</span>
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  size="lg"
                  className="group px-4 sm:px-12 py-3 sm:py-6 text-xs sm:text-base font-mono font-bold uppercase tracking-wider border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary rounded-none transition-all duration-300 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon
                    icon={isLoading ? faSpinner : faShieldAlt}
                    className={`mr-2 sm:mr-3 text-sm sm:text-base ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <span className="hidden sm:inline">{isLoading ? "[LOADING...]" : "[AUTHENTICATE]"}</span>
                  <span className="sm:hidden">{isLoading ? "[LOAD]" : "[AUTH]"}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Features Grid - Compact mobile (2x2), desktop (4 cols) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 pt-4 sm:pt-12">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group p-2 sm:p-6 ${
                  theme === "light"
                    ? "bg-card/80 backdrop-blur-lg backdrop-saturate-150 rounded-xl sm:rounded-2xl border border-border/50 shadow-lg hover:shadow-2xl hover:scale-105"
                    : "bg-primary/5 border border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                } transition-all duration-300`}
              >
                <div className="flex flex-col items-center text-center space-y-1 sm:space-y-3">
                  <div
                    className={`w-8 h-8 sm:w-16 sm:h-16 flex items-center justify-center ${
                      theme === "light"
                        ? "bg-primary/10 rounded-xl sm:rounded-2xl"
                        : "bg-primary/10 border border-primary/30"
                    } group-hover:scale-110 transition-transform`}
                  >
                    <FontAwesomeIcon
                      icon={feature.icon}
                      className={`text-base sm:text-3xl text-primary ${theme === "dark" ? "group-hover:animate-pulse" : ""}`}
                    />
                  </div>
                  <h3
                    className={`text-xs sm:text-lg font-bold leading-tight ${
                      theme === "light" ? "text-foreground" : "font-mono text-primary"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`text-[10px] sm:text-sm leading-tight ${
                      theme === "light"
                        ? "text-muted-foreground"
                        : "font-mono text-primary/60"
                    }`}
                  >
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Compact mobile */}
          <div className="text-center pt-4 sm:pt-12">
            <p
              className={`text-[10px] sm:text-sm ${
                theme === "light"
                  ? "text-muted-foreground italic"
                  : "font-mono text-primary/50"
              }`}
            >
              {theme === "light"
                ? "MaestroSalle v2.0 • Propulsé par Next.js & Firebase"
                : "MAESTRO_OS.v2.0 | POWERED BY NEXT.JS & FIREBASE"}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvitationCodeModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSubmit={handleCodeSubmit}
        isLoading={isValidatingCode}
      />
      <UserProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
        isLoading={isCreatingAccount}
        initialData={
          pendingUserData
            ? {
                displayName: pendingUserData.user.displayName || "",
                email: pendingUserData.user.email || "",
                avatarUrl: pendingUserData.user.photoURL || "",
              }
            : { displayName: "", email: "", avatarUrl: "" }
        }
      />

      {/* Custom animations */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
