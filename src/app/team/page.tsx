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
import { faPhone, faMessage, faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
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

export default function TeamPage() {
  const usersObj = useUsersStore((s) => s.users);
  const users = Object.values(usersObj);
  console.log("TEAM DEBUG usersObj:", usersObj);
  console.log("TEAM DEBUG users:", users);
  const grouped = groupByRole(users);
  console.log("TEAM DEBUG grouped:", grouped);

  useEffect(() => {
    const unsubscribe = listenToUsers();
    return () => unsubscribe && unsubscribe();
  }, []);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

          const hasHydrated = useAppStore((state) => state.hasHydrated);
    
        if (!hasHydrated) return null; // Avoid UI flicker


  const handleCardClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-8">L&#39;équipe</h1>
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([role, users]) => (
            <div key={role}>
              <h2 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
                <Badge variant="outline" className="uppercase tracking-wide text-xs">{role}</Badge>
              </h2>
              <div className="w-fit gap-6">
                {users.map((user) => (
                  <Card key={user.email} className="p-6 cursor-pointer rounded flex flex-col items-center gap-4 cursor-pointe bg-accent/70 hover:bg-secondary-foreground/20 hover:shadow-lg  shadow-primary hover:scale-105 transition" onClick={() => handleCardClick(user)}>
                    <div className="flex items-center md:items-start w-full gap-6">
                      <div className="flex flex-col items-center mb-4">
                        <Avatar className="size-24 mb-2">
                          <AvatarImage src={user.avatarUrl || ""} alt="Avatar" />
                          <AvatarFallback>{(user.displayName||"?").split(" ").map(n=>n[0]).join("").toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col items-start w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl font-semibold">{user.displayName || <span className="text-gray-400">Nom inconnu</span>}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="uppercase tracking-wide text-xs">{user.role || "?"}</Badge>
                            {user.isAdmin && <Badge className="uppercase">admin</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span>{user.birthday ? new Date(user.birthday).toLocaleDateString() : <span className="text-gray-400">Non renseignée</span>}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span>{user.phone || <span className="text-gray-400">Non renseigné</span>}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span>{user.email || <span className="text-gray-400">Non renseigné</span>}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Depuis :</span>
                          <span>{user.since ? new Date(user.since).toLocaleDateString() : <span className="text-gray-400">Non renseigné</span>}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Dialog open={modalOpen} onOpenChange={v => { if (!v) closeModal(); }}>
        <DialogContent className="max-w-sm w-xs">
          <DialogHeader>
            <DialogTitle><FontAwesomeIcon icon={faUser} className="mr-1" fixedWidth/>{selectedUser?.displayName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <a
              href={selectedUser?.phone ? `tel:${selectedUser.phone}` : undefined}
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full flex items-center gap-2" disabled={!selectedUser?.phone}>
                <FontAwesomeIcon icon={faPhone} />
                Appeler
              </Button>
            </a>
            <a
              href={selectedUser?.phone ? `https://wa.me/${selectedUser.phone.replace(/\D/g, "")}` : undefined}
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full flex items-center gap-2" disabled={!selectedUser?.phone}>
                <FontAwesomeIcon icon={faMessage} />
                Message
              </Button>
            </a>
            <a
              href={selectedUser?.email ? `mailto:${selectedUser.email}` : undefined}
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full flex items-center gap-2" disabled={!selectedUser?.email}>
                <FontAwesomeIcon icon={faEnvelope} />
                Mail
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
