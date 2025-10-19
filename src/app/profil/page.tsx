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
import { faPen, faUserCircle } from "@fortawesome/free-solid-svg-icons";
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
    const [editField, setEditField] = useState<null | "displayName" | "birthday" | "phone" | "since">(null);
    const [editValue, setEditValue] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const isAdmin = useUserStore((s) => s.isAdmin);

    // Synchronise le store avec Firestore à chaque chargement du profil
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
    
        if (!hasHydrated) return null; // Avoid UI flicker


    const openEdit = (field: "displayName" | "birthday" | "phone" | "since", currentValue: string) => {
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
            if (editField === "displayName") setUser(userId, role, email, null, avatarUrl, editValue);
            if (editField === "phone") setPhone(editValue);
            if (editField === "birthday") setBirthday(editValue);
            if (editField === "since") setSince(editValue);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
            closeEdit();
        } catch {
            alert("Erreur lors de la sauvegarde");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="max-w-lg mx-auto mt-8 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserCircle} />
                        Mon profil
                    </h1>
                    <p className="text-muted-foreground">
                        Gérez vos informations personnelles et vos coordonnées
                    </p>
                </div>
                <Card className="p-6 rounded shadow flex flex-col items-center gap-4">
                    <div className="flex items-center md:items-start w-full gap-6">
                        <div className="flex flex-col items-center mb-4">
                            <Avatar className="size-24 mb-2">
                                <AvatarImage
                                    src={avatarUrl || ""}
                                    alt="Avatar"
                                />
                                <AvatarFallback>
                                    {(displayName || "?")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex flex-col items-start w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl font-semibold">
                                    {displayName || (
                                        <span className="text-gray-400">
                                            Nom inconnu
                                        </span>
                                    )}
                                </span>
                                <button
                                    aria-label="Modifier le nom"
                                    className="ml-1 text-gray-500 hover:text-primary"
                                    onClick={() =>
                                        openEdit("displayName", displayName || "")
                                    }
                                >
                                    <FontAwesomeIcon icon={faPen} size="sm" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                { isAdmin && (
                                    <Badge className="uppercase tracking-wide text-xs mb-4">
                                        Admin
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="uppercase tracking-wide text-xs mb-4"
                                >
                                    {role || "?"}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">Date de naissance :</span>
                                <span>
                                    {birthday
                                        ? new Date(birthday).toLocaleDateString()
                                        : (
                                            <span className="text-gray-400">
                                                Non renseignée
                                            </span>
                                        )}
                                </span>
                                <button
                                    aria-label="Modifier la date de naissance"
                                    className="ml-1 text-gray-500 hover:text-primary"
                                    onClick={() => openEdit("birthday", birthday)}
                                >
                                    <FontAwesomeIcon icon={faPen} size="sm" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">Téléphone :</span>
                                <span>
                                    {phone || (
                                        <span className="text-gray-400">
                                            Non renseigné
                                        </span>
                                    )}
                                </span>
                                <button
                                    aria-label="Modifier le téléphone"
                                    className="ml-1 text-gray-500 hover:text-primary"
                                    onClick={() => openEdit("phone", phone)}
                                >
                                    <FontAwesomeIcon icon={faPen} size="sm" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">Email :</span>
                                <span>
                                    {email || (
                                        <span className="text-gray-400">
                                            Non renseigné
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">Membre depuis :</span>
                                <span>
                                    {since
                                        ? new Date(since).toLocaleDateString()
                                        : (
                                            <span className="text-gray-400">
                                                Non renseigné
                                            </span>
                                        )}
                                </span>
                                <button
                                    aria-label="Modifier la date d'arrivée"
                                    className="ml-1 text-gray-500 hover:text-primary"
                                    onClick={() => openEdit("since", since)}
                                >
                                    <FontAwesomeIcon icon={faPen} size="sm" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <Dialog open={!!editField} onOpenChange={(v) => !v && closeEdit()}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editField === "displayName" &&
                                        "Modifier le nom affiché"}
                                    {editField === "birthday" &&
                                        "Modifier la date de naissance"}
                                    {editField === "phone" && "Modifier le téléphone"}
                                    {editField === "since" && "Modifier la date d'arrivée"}
                                </DialogTitle>
                            </DialogHeader>
                            {editField === "displayName" && (
                                <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            )}
                            {editField === "birthday" && (
                                <Input
                                    type="date"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            )}
                            {editField === "phone" && (
                                <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="06 12 34 56 78"
                                    autoFocus
                                />
                            )}
                            {editField === "since" && (
                                <Input
                                    type="date"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            )}
                            <DialogFooter>
                                <Button
                                    onClick={handleEditSave}
                                    disabled={modalLoading}
                                    type="button"
                                >
                                    {modalLoading ? "Sauvegarde..." : "Enregistrer"}
                                </Button>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">
                                        Annuler
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {success && (
                        <div className="text-green-600 text-center">
                            Profil mis à jour !
                        </div>
                    )}
                </Card>
            </main>
        </>
    );
}
