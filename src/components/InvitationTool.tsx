// Composant de génération de codes d'invitation à usage unique
"use client";
import React, { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createInvitation, InvitationRole } from "@/lib/firebase/invitations";
import { useUserStore } from "@/store/useUserStore";
import { useUsersStore } from "@/store/useUsersStore";
import { collection, onSnapshot, deleteDoc, doc, QueryDocumentSnapshot} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Trash2 } from "lucide-react";
import { SectionSeparatorStack } from "./SectionSeparatorStack";

const ROLES: InvitationRole[] = ["owner", "manager", "CDI", "cuisine", "extra"];

export default function InvitationTool() {
  const userId = useUserStore((s) => s.userId);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const role = useUserStore((s) => s.role);
  const [selectedRole, setSelectedRole] = useState<InvitationRole>("CDI");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const usersStore = useUsersStore();

  // --- Historique des invitations ---
  // Typage strict pour l'invitation
  type InvitationRow = {
    id: string;
    code: string;
    role: string;
    createdBy: string;
    usedBy?: string;
    createdAt?: { seconds: number; nanoseconds: number };
  };
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  useEffect(() => {
    const colRef = collection(db, "invitations");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      setInvitations(
        snap.docs.map((d: QueryDocumentSnapshot) => {
          const data = d.data() as InvitationRow;
          return {
            id: d.id,
            code: data.code,
            role: data.role,
            createdBy: data.createdBy,
            usedBy: data.usedBy,
            createdAt: data.createdAt,
          } satisfies InvitationRow;
        })
      );
    });
    return () => unsubscribe();
  }, []);

  if (
    !userId ||
    !(
      isAdmin ||
      (role === "owner" as InvitationRole) ||
      (role === "manager" as InvitationRole)
    )
  ) {
    return null;
  }

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const code = await createInvitation({
        role: selectedRole,
        createdBy: userId,
      });
      setGeneratedCode(code);
      navigator.clipboard.writeText(code);
      toast.success(`Code ${code} généré et copié !`);
    } catch {
      toast.error("Erreur lors de la génération du code");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "invitations", id));
    toast.success("Invitation supprimée");
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast("Code copié dans le presse-papier !", {
      description: code,
      duration: 2000,
    });
  };

  // Utilitaire pour fallback displayName/avatar (comme DisposCardsPlanning)
  function getUserMeta(userId: string | undefined) {
    if (!userId) return { displayName: "?", avatarUrl: undefined };
    const user = usersStore.users[userId];
    return {
      displayName: user?.displayName || userId,
      avatarUrl: user?.avatarUrl,
    };
  }

  return (
    <CardContent className="py-2 flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <div className="flex gap-2 grow">
                <Label className="w-fit">Rôle attribué</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as InvitationRole)}>
                <SelectTrigger className="grow">
                    <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent>
                    {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="">
                Générer le code
            </Button>
        </div>
      {generatedCode && (
        <div className="flex flex-col items-center gap-1 mt-2">
          <span
            className="cursor-pointer font-mono text-2xl tracking-widest bg-muted px-4 py-2 rounded hover:bg-muted/70 transition"
            onClick={() => handleCopy(generatedCode)}
            title="Cliquer pour copier le code"
          >
            {generatedCode}
          </span>
        </div>
      )}
      <SectionSeparatorStack space={2} />
      {/* Historique des invitations */}
      <div className="flex flex-col gap-2">
        <h3 className="font-bold mb-2 text-lg">Historique des invitations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm rounded shadow">
            <thead>
              <tr className="bg-muted text-xs text-left">
                <th className="p-2 font-semibold">Code</th>
                <th className="p-2 font-semibold">Rôle</th>
                <th className="p-2 font-semibold">Créé par</th>
                <th className="p-2 font-semibold">Utilisé par</th>
                <th className="p-2 font-semibold">Date</th>
                <th className="p-2 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.length === 0 && (
                <tr><td colSpan={6} className="text-center p-4 text-muted-foreground">Aucune invitation</td></tr>
              )}
              {invitations.map((inv) => {
                const creatorMeta = getUserMeta(inv.createdBy);
                const usedUserMeta = getUserMeta(inv.usedBy);
                return (
                  <tr key={inv.id} className="border-b hover:bg-muted/40 transition">
                    <td className="p-2 font-mono gap-2">
                      <span
                        className="cursor-pointer hover:underline hover:text-primary transition"
                        title="Cliquer pour copier le code"
                        onClick={() => handleCopy(inv.code)}
                      >
                        {inv.code}
                      </span>
                    </td>
                    <td className="p-2 capitalize min-w-[70px]">{inv.role}</td>
                    <td className="p-2 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          {creatorMeta.avatarUrl ? (
                            <AvatarImage src={creatorMeta.avatarUrl} alt={creatorMeta.displayName} />
                          ) : (
                            <AvatarFallback>{creatorMeta.displayName.slice(0,2).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                        <span className="truncate max-w-[100px]">{creatorMeta.displayName}</span>
                      </div>
                    </td>
                    <td className="p-2 min-w-[160px]">
                      {inv.usedBy ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            {usedUserMeta.avatarUrl ? (
                              <AvatarImage src={usedUserMeta.avatarUrl} alt={usedUserMeta.displayName} />
                            ) : (
                              <AvatarFallback>{usedUserMeta.displayName.slice(0,2).toUpperCase()}</AvatarFallback>
                            )}
                          </Avatar>
                          <span className="truncate max-w-[100px]">{usedUserMeta.displayName}</span>
                        </div>
                      ) : <span className="italic text-muted-foreground">—</span>}
                    </td>
                    <td className="p-2 ">{inv.createdAt && inv.createdAt.seconds ? new Date(inv.createdAt.seconds * 1000).toLocaleDateString() : ""}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(inv.code)}
                          title="Copier le code"
                          className="cursor-pointer hover:text-primary"
                        >
                          <Copy size={16} />
                        </Button>
                        <Button onClick={() => handleDelete(inv.id)} title="Supprimer" className="cursor-pointer"><Trash2 size={16} className="text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </CardContent>
  );
}
