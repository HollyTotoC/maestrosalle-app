"use client";

import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faUserCircle,
  faBirthdayCake,
  faPhone,
  faEnvelope,
  faCalendar,
  faShieldAlt,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useAppStore } from "@/store/store";

export default function ProfilPage() {
  const displayName = useUserStore((s) => s.displayName);
  const setUser = useUserStore((s) => s.setUser);
  const avatarUrl = useUserStore((s) => s.avatarUrl);
  const email = useUserStore((s) => s.email);
  const role = useUserStore((s) => s.role);
  const userId = useUserStore((s) => s.userId);
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [since, setSince] = useState("");
  const [success, setSuccess] = useState(false);
  const [editField, setEditField] = useState<
    null | "displayName" | "birthday" | "phone" | "since"
  >(null);
  const [editValue, setEditValue] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const isAdmin = useUserStore((s) => s.isAdmin);

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, "users", userId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUser(
          userId,
          data.role ?? null,
          data.email ?? email,
          data.restaurantId ?? null,
          data.avatarUrl ?? avatarUrl,
          data.displayName ?? displayName
        );
        setPhone(data.phone || "");
        setBirthday(data.birthday || "");
        setSince(data.since || "");
      }
    });
    // eslint-disable-next-line
  }, [userId]);

  const hasHydrated = useAppStore((state) => state.hasHydrated);

  if (!hasHydrated) return null;

  const openEdit = (
    field: "displayName" | "birthday" | "phone" | "since",
    currentValue: string
  ) => {
    setEditField(field);
    setEditValue(currentValue || "");
  };

  const closeEdit = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleEditSave = async () => {
    if (!userId || !editField) return;
    setModalLoading(true);
    try {
      const update: Record<string, string> = {};
      update[editField] = editValue;
      await updateDoc(doc(db, "users", userId), update);
      if (editField === "displayName")
        setUser(userId, role, email, null, avatarUrl, editValue);
      if (editField === "phone") setPhone(editValue);
      if (editField === "birthday") setBirthday(editValue);
      if (editField === "since") setSince(editValue);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      closeEdit();
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setModalLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case "displayName":
        return "Modifier le nom";
      case "birthday":
        return "Modifier la date de naissance";
      case "phone":
        return "Modifier le téléphone";
      case "since":
        return "Modifier la date d'arrivée";
      default:
        return "Modifier";
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Container glassmorphism - Mini-App wrapper */}
        <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground mb-2">
              <FontAwesomeIcon icon={faUserCircle} className="text-primary" />
              Mon profil
            </h1>
            <p className="text-muted-foreground dark:font-mono dark:text-primary/60">
              Gérez vos informations personnelles et vos coordonnées
            </p>
          </div>

          {/* Profile Card */}
          <Card className="relative p-8 bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
            {/* Admin badge (if applicable) */}
            {isAdmin && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-destructive/20 dark:bg-destructive/10 text-destructive dark:text-red-400 border-destructive/50 dark:border-red-500/50 uppercase text-xs font-mono">
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-1" />
                  Admin
                </Badge>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 ring-4 ring-border/30 dark:ring-primary/20 shadow-xl dark:shadow-none">
                  <AvatarImage src={avatarUrl || ""} alt="Avatar" />
                  <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary text-3xl font-bold dark:font-mono">
                    {getInitials(displayName || "?")}
                  </AvatarFallback>
                </Avatar>

                {role && (
                  <Badge
                    variant="outline"
                    className="uppercase tracking-wide text-sm font-mono border-2 px-4 py-1"
                  >
                    {role}
                  </Badge>
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1 w-full space-y-4">
                {/* Display Name */}
                <div className="group">
                  <div className="flex items-center justify-between p-4 rounded-xl dark:rounded-lg bg-muted/30 dark:bg-primary/5 border border-border/50 dark:border-primary/20 hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1">
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="w-5 h-5 text-primary/60"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-primary/50 dark:font-mono mb-1">
                          Nom affiché
                        </p>
                        <p className="font-semibold dark:font-mono dark:text-primary">
                          {displayName || (
                            <span className="text-muted-foreground dark:text-primary/40 italic">
                              Non renseigné
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openEdit("displayName", displayName || "")}
                      className="p-2 rounded-lg dark:rounded-sm hover:bg-primary/10 text-primary/60 hover:text-primary transition-all duration-200 dark:duration-300"
                      aria-label="Modifier le nom"
                    >
                      <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email (non-editable) */}
                <div>
                  <div className="flex items-center gap-3 p-4 rounded-xl dark:rounded-lg bg-muted/20 dark:bg-primary/5 border border-border/30 dark:border-primary/10">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="w-5 h-5 text-primary/60"
                    />
                    <div>
                      <p className="text-xs text-muted-foreground dark:text-primary/50 dark:font-mono mb-1">
                        Email
                      </p>
                      <p className="font-semibold dark:font-mono dark:text-primary truncate">
                        {email || (
                          <span className="text-muted-foreground dark:text-primary/40 italic">
                            Non renseigné
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="group">
                  <div className="flex items-center justify-between p-4 rounded-xl dark:rounded-lg bg-muted/30 dark:bg-primary/5 border border-border/50 dark:border-primary/20 hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="w-5 h-5 text-primary/60"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-primary/50 dark:font-mono mb-1">
                          Téléphone
                        </p>
                        <p className="font-semibold dark:font-mono dark:text-primary">
                          {phone || (
                            <span className="text-muted-foreground dark:text-primary/40 italic">
                              Non renseigné
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openEdit("phone", phone)}
                      className="p-2 rounded-lg dark:rounded-sm hover:bg-primary/10 text-primary/60 hover:text-primary transition-all duration-200 dark:duration-300"
                      aria-label="Modifier le téléphone"
                    >
                      <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Birthday */}
                <div className="group">
                  <div className="flex items-center justify-between p-4 rounded-xl dark:rounded-lg bg-muted/30 dark:bg-primary/5 border border-border/50 dark:border-primary/20 hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1">
                      <FontAwesomeIcon
                        icon={faBirthdayCake}
                        className="w-5 h-5 text-primary/60"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-primary/50 dark:font-mono mb-1">
                          Date de naissance
                        </p>
                        <p className="font-semibold dark:font-mono dark:text-primary">
                          {birthday ? (
                            new Date(birthday).toLocaleDateString("fr-FR")
                          ) : (
                            <span className="text-muted-foreground dark:text-primary/40 italic">
                              Non renseignée
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openEdit("birthday", birthday)}
                      className="p-2 rounded-lg dark:rounded-sm hover:bg-primary/10 text-primary/60 hover:text-primary transition-all duration-200 dark:duration-300"
                      aria-label="Modifier la date de naissance"
                    >
                      <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Since */}
                <div className="group">
                  <div className="flex items-center justify-between p-4 rounded-xl dark:rounded-lg bg-muted/30 dark:bg-primary/5 border border-border/50 dark:border-primary/20 hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="w-5 h-5 text-primary/60"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-primary/50 dark:font-mono mb-1">
                          Membre depuis
                        </p>
                        <p className="font-semibold dark:font-mono dark:text-primary">
                          {since ? (
                            new Date(since).toLocaleDateString("fr-FR")
                          ) : (
                            <span className="text-muted-foreground dark:text-primary/40 italic">
                              Non renseigné
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openEdit("since", since)}
                      className="p-2 rounded-lg dark:rounded-sm hover:bg-primary/10 text-primary/60 hover:text-primary transition-all duration-200 dark:duration-300"
                      aria-label="Modifier la date d'arrivée"
                    >
                      <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mt-6 p-4 rounded-xl dark:rounded-lg bg-success/10 dark:bg-success/5 border-2 border-success/50 dark:border-success/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-success w-5 h-5"
                />
                <p className="font-semibold dark:font-mono text-success">
                  Profil mis à jour !
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editField} onOpenChange={(v) => !v && closeEdit()}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl dark:bg-background/98 dark:backdrop-blur-none rounded-2xl dark:rounded-sm border-2 border-border/50 dark:border-primary/30 shadow-2xl dark:shadow-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:font-mono dark:text-primary">
              {editField && getFieldLabel(editField)}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {editField === "displayName" && (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Votre nom complet"
                className="rounded-xl dark:rounded-lg dark:font-mono dark:bg-primary/5 dark:border-primary/30 transition-all duration-200"
                autoFocus
              />
            )}
            {editField === "birthday" && (
              <Input
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="rounded-xl dark:rounded-lg dark:font-mono dark:bg-primary/5 dark:border-primary/30 transition-all duration-200"
                autoFocus
              />
            )}
            {editField === "phone" && (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="06 12 34 56 78"
                className="rounded-xl dark:rounded-lg dark:font-mono dark:bg-primary/5 dark:border-primary/30 transition-all duration-200"
                autoFocus
              />
            )}
            {editField === "since" && (
              <Input
                type="date"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="rounded-xl dark:rounded-lg dark:font-mono dark:bg-primary/5 dark:border-primary/30 transition-all duration-200"
                autoFocus
              />
            )}
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                className="rounded-xl dark:rounded-sm dark:font-mono dark:border-primary/30 transition-all duration-200"
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              onClick={handleEditSave}
              disabled={modalLoading}
              type="button"
              className="rounded-xl dark:rounded-sm dark:font-mono transition-all duration-200"
            >
              {modalLoading ? "Sauvegarde..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
