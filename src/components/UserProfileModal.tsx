import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        displayName: string;
        email: string;
        avatarUrl: string;
        phone: string;
        birthday: string;
        since: string;
    }) => void;
    initialData: {
        displayName: string;
        email: string;
        avatarUrl: string;
    };
    isLoading?: boolean;
}

export function UserProfileModal({
    open,
    onClose,
    onSubmit,
    initialData,
    isLoading = false,
}: UserProfileModalProps) {
    const [displayName, setDisplayName] = useState(
        initialData.displayName || ""
    );
    const [email, setEmail] = useState(initialData.email || "");
    const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
    const [phone, setPhone] = useState("");
    const [birthday, setBirthday] = useState("");
    const [since, setSince] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    });

    // Synchronise les champs avec initialData à chaque ouverture ou changement de données
    React.useEffect(() => {
        setDisplayName(initialData.displayName || "");
        setEmail(initialData.email || "");
        setAvatarUrl(initialData.avatarUrl || "");
        setPhone("");
        setBirthday("");
        setSince(() => {
            const d = new Date();
            return d.toISOString().slice(0, 10);
        });
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ displayName, email, avatarUrl, phone, birthday, since });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className="
                    bg-card/60 backdrop-blur-xl backdrop-saturate-150
                    dark:bg-card dark:backdrop-blur-none
                    rounded-2xl dark:rounded-sm
                    border border-border/50 dark:border-2
                    shadow-lg dark:shadow-sm
                    transition-all duration-200 dark:duration-300
                "
            >
                <DialogHeader>
                    <DialogTitle className="dark:font-mono">Complétez votre profil</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 items-center"
                >
                    <Avatar className="size-24 mb-2">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback>
                            {displayName
                                ? displayName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                : "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="w-full flex flex-col gap-2">
                        <div>
                            <Label className="dark:font-mono">Nom affiché</Label>
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <Label className="dark:font-mono">Email</Label>
                            <Input
                                value={email}
                                disabled
                                className="bg-muted cursor-not-allowed"
                                type="email"
                            />
                        </div>
                        <div>
                            <Label className="dark:font-mono">Téléphone</Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="06..."
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <Label className="dark:font-mono">Date de naissance</Label>
                            <Input
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                type="date"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <Label className="dark:font-mono">Entrée dans l&apos;équipe (depuis)</Label>
                            <Input
                                value={since}
                                onChange={(e) => setSince(e.target.value)}
                                type="date"
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter className="w-full flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="
                                flex-1
                                rounded-lg dark:rounded-sm
                                dark:font-mono
                                transition-all duration-200 dark:duration-300
                            "
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="
                                flex-1
                                rounded-lg dark:rounded-sm
                                dark:font-mono
                                transition-all duration-200 dark:duration-300
                            "
                            disabled={isLoading}
                        >
                            {isLoading && <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />}
                            {isLoading ? "Création..." : "Valider"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
