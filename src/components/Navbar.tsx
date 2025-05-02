"use client";

import { useAppStore } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Switch } from "@/components/ui/switch"; // Import the Switch component
import { logout } from "@/lib/firebase";
import { useUserStore } from "@/store/useUserStore"; // Zustand store for user data
import { useEffect, useState } from "react";

export default function Navbar() {
    const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);

    // const userId = useUserStore((state) => state.userId);
    // const role = useUserStore((state) => state.role);
    // const restaurantId = useUserStore((state) => state.restaurantId);
    const avatarUrl = useUserStore((state) => state.avatarUrl);
    const displayName = useUserStore((state) => state.displayName);

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/"; // Redirige vers la page d'accueil
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Fonction pour calculer les initiales
    const getInitials = (name: string | null | undefined) => {
        if (!name) return "?"; // Fallback to "?" if no name is provided
        const parts = name.split(" ");
        const initials = parts
            .map((part) => part[0])
            .join("")
            .toUpperCase();
        return initials || "?";
    };

    const handleChangeRestaurant = () => {
        useAppStore.setState({ selectedRestaurant: null });
    }

    const [isDarkMode, setIsDarkMode] = useState(false);

    // Sync the state with localStorage and the DOM on initial load
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        const isDark = storedTheme === "dark";
        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Toggle the theme and update localStorage
    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <nav className="flex items-center justify-between px-4 py-2 shadow-sm dark:shadow-neutral-600 bg-white dark:bg-black">
            {/* Nom du restaurant */}
            <div className="text-xl font-bold cursor-pointer" onClick={handleChangeRestaurant}>
                {selectedRestaurant ? selectedRestaurant : "MaestroSalle"}
            </div>

            {/* Menu de navigation */}
            {selectedRestaurant && (
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink href="/dashboard/orders">
                                Commandes
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink href="/dashboard/tables">
                                Tables
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink href="/dashboard/settings">
                                Paramètres
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            )}

            <div className="flex items-center gap-4">
                {/* Dark mode switch */}
                <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                    aria-label="Toggle dark mode"
                />

                {/* Avatar with dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarImage src={avatarUrl} alt="Avatar" />
                            <AvatarFallback>
                                {getInitials(displayName)}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-600 hover:bg-red-100"
                        >
                            Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}
