"use client";

import { useEffect, useState } from "react";
import { useUsersStore } from "@/store/useUsersStore";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { User } from "@/types/user";
import { listenToUsers } from "@/lib/firebase/server";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faMessage,
  faEnvelope,
  faUser,
  faUsers,
  faBirthdayCake,
  faCalendar,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/store";

type GroupedUsers = Record<string, User[]>;

function groupByRole(users: User[]): GroupedUsers {
  const groups: GroupedUsers = {};
  Object.values(users).forEach((user) => {
    if (!groups[user.role ?? ""]) groups[user.role ?? ""] = [];
    groups[user.role ?? ""].push(user);
  });
  return groups;
}

// Badge colors by role
const getRoleBadgeClass = (role: string) => {
  const baseClass =
    "uppercase tracking-wide text-xs font-mono border-2 transition-all duration-200";
  switch (role.toLowerCase()) {
    case "owner":
      return `${baseClass} bg-gradient-to-r from-amber-500/20 to-amber-600/20 dark:from-amber-500/10 dark:to-amber-600/10 border-amber-500/40 dark:border-amber-500/50 text-amber-700 dark:text-amber-400`;
    case "manager":
      return `${baseClass} bg-gradient-to-r from-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:to-blue-600/10 border-blue-500/40 dark:border-blue-500/50 text-blue-700 dark:text-blue-400`;
    case "cdi":
      return `${baseClass} bg-gradient-to-r from-green-500/20 to-green-600/20 dark:from-green-500/10 dark:to-green-600/10 border-green-500/40 dark:border-green-500/50 text-green-700 dark:text-green-400`;
    case "cuisine":
      return `${baseClass} bg-gradient-to-r from-orange-500/20 to-orange-600/20 dark:from-orange-500/10 dark:to-orange-600/10 border-orange-500/40 dark:border-orange-500/50 text-orange-700 dark:text-orange-400`;
    case "extra":
      return `${baseClass} bg-gradient-to-r from-purple-500/20 to-purple-600/20 dark:from-purple-500/10 dark:to-purple-600/10 border-purple-500/40 dark:border-purple-500/50 text-purple-700 dark:text-purple-400`;
    default:
      return `${baseClass} bg-muted/50 border-border text-muted-foreground`;
  }
};

export default function TeamPage() {
  const usersObj = useUsersStore((s) => s.users);
  const users = Object.values(usersObj);
  const grouped = groupByRole(users);

  useEffect(() => {
    const unsubscribe = listenToUsers((usersData) => {
      const setUsers = useUsersStore.getState().setUsers;
      setUsers(usersData);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const hasHydrated = useAppStore((state) => state.hasHydrated);

  if (!hasHydrated) return null;

  const handleCardClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Container glassmorphism - Mini-App wrapper */}
        <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground mb-2">
              <FontAwesomeIcon icon={faUsers} className="text-primary" />
              L&apos;équipe
            </h1>
            <p className="text-muted-foreground dark:font-mono dark:text-primary/60">
              Consultez les profils de vos collègues et leurs coordonnées
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {Object.entries(grouped).map(([role, usersInRole]) => (
              <div key={role}>
                {/* Role Header */}
                <div className="mb-6 flex items-center gap-3">
                  <Badge className={getRoleBadgeClass(role)}>{role || "Non défini"}</Badge>
                  <span className="text-sm text-muted-foreground dark:font-mono dark:text-primary/50">
                    {usersInRole.length} membre{usersInRole.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersInRole.map((user) => (
                    <Card
                      key={user.email}
                      onClick={() => handleCardClick(user)}
                      className="group relative p-5 cursor-pointer bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm hover:shadow-2xl dark:hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 dark:duration-300 hover:border-primary/50 dark:hover:border-primary/60"
                    >
                      {/* Admin badge (if applicable) */}
                      {user.isAdmin && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-destructive/20 dark:bg-destructive/10 text-destructive dark:text-red-400 border-destructive/50 dark:border-red-500/50 uppercase text-xs font-mono">
                            <FontAwesomeIcon icon={faShieldAlt} className="mr-1" />
                            Admin
                          </Badge>
                        </div>
                      )}

                      <div className="flex flex-col items-center gap-4">
                        {/* Avatar */}
                        <Avatar className="w-20 h-20 ring-4 ring-border/30 dark:ring-primary/20 group-hover:ring-primary/40 dark:group-hover:ring-primary/40 transition-all duration-200">
                          <AvatarImage src={user.avatarUrl || ""} alt={user.displayName || "Avatar"} />
                          <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary text-lg font-bold dark:font-mono">
                            {getInitials(user.displayName || "?")}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="w-full text-center space-y-2">
                          <h3 className="text-lg font-bold text-foreground dark:font-mono dark:text-primary truncate">
                            {user.displayName || (
                              <span className="text-muted-foreground dark:text-primary/40 italic">
                                Nom inconnu
                              </span>
                            )}
                          </h3>

                          {/* Compact info */}
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground dark:text-primary/60 dark:font-mono">
                            {user.birthday && (
                              <div className="flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faBirthdayCake} className="w-4 h-4 text-primary/60" />
                                <span>{new Date(user.birthday).toLocaleDateString("fr-FR")}</span>
                              </div>
                            )}

                            {user.since && (
                              <div className="flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-primary/60" />
                                <span>Depuis {new Date(user.since).toLocaleDateString("fr-FR")}</span>
                              </div>
                            )}
                          </div>

                          {/* Contact hint */}
                          <div className="pt-2 text-xs text-primary/50 dark:font-mono">
                            Cliquez pour contacter
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {/* Empty state */}
            {users.length === 0 && (
              <div className="text-center py-12">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-6xl text-muted-foreground/30 dark:text-primary/20 mb-4"
                />
                <p className="text-muted-foreground dark:text-primary/60 dark:font-mono">
                  Aucun membre dans l&apos;équipe
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Modal */}
      <Dialog open={modalOpen} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl dark:bg-background/98 dark:backdrop-blur-none rounded-2xl dark:rounded-sm border-2 border-border/50 dark:border-primary/30 shadow-2xl dark:shadow-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold dark:font-mono dark:text-primary flex items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                <AvatarImage src={selectedUser?.avatarUrl || ""} alt={selectedUser?.displayName || "Avatar"} />
                <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-bold dark:font-mono">
                  {getInitials(selectedUser?.displayName || "?")}
                </AvatarFallback>
              </Avatar>
              {selectedUser?.displayName}
            </DialogTitle>
          </DialogHeader>

          {/* User details */}
          <div className="space-y-3 py-4 text-sm dark:font-mono">
            {selectedUser?.email && (
              <div className="flex items-center gap-2 text-muted-foreground dark:text-primary/70">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-primary" />
                <span className="truncate">{selectedUser.email}</span>
              </div>
            )}
            {selectedUser?.phone && (
              <div className="flex items-center gap-2 text-muted-foreground dark:text-primary/70">
                <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-primary" />
                <span>{selectedUser.phone}</span>
              </div>
            )}
            {selectedUser?.birthday && (
              <div className="flex items-center gap-2 text-muted-foreground dark:text-primary/70">
                <FontAwesomeIcon icon={faBirthdayCake} className="w-4 h-4 text-primary" />
                <span>{new Date(selectedUser.birthday).toLocaleDateString("fr-FR")}</span>
              </div>
            )}
            {selectedUser?.since && (
              <div className="flex items-center gap-2 text-muted-foreground dark:text-primary/70">
                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-primary" />
                <span>Membre depuis {new Date(selectedUser.since).toLocaleDateString("fr-FR")}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-4">
            <a
              href={selectedUser?.phone ? `tel:${selectedUser.phone}` : undefined}
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="w-full rounded-xl dark:rounded-sm dark:font-mono transition-all duration-200 dark:duration-300"
                disabled={!selectedUser?.phone}
              >
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                Appeler
              </Button>
            </a>

            <a
              href={
                selectedUser?.phone
                  ? `https://wa.me/${selectedUser.phone.replace(/\D/g, "")}`
                  : undefined
              }
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="w-full rounded-xl dark:rounded-sm dark:font-mono transition-all duration-200 dark:duration-300"
                disabled={!selectedUser?.phone}
                variant="outline"
              >
                <FontAwesomeIcon icon={faMessage} className="mr-2" />
                WhatsApp
              </Button>
            </a>

            <a
              href={selectedUser?.email ? `mailto:${selectedUser.email}` : undefined}
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="w-full rounded-xl dark:rounded-sm dark:font-mono transition-all duration-200 dark:duration-300"
                disabled={!selectedUser?.email}
                variant="outline"
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Email
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
