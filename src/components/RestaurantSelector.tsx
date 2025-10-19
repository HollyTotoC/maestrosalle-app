"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils, faPlus } from "@fortawesome/free-solid-svg-icons";

import { addRestaurant, listenToRestaurants } from "@/lib/firebase/server";
import { useAppStore } from "@/store/store";
import { Restaurant } from "@/types/restaurant";
import { auth } from "@/lib/firebase/client";
import { useTheme } from "@/components/ThemeProvider";

export default function RestaurantSelector() {
    const { theme } = useTheme();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [newRestaurantName, setNewRestaurantName] = useState("");
    const [newRestaurantPicture, setNewRestaurantPicture] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const setSelectedRestaurant = useAppStore(
        (state) => state.setSelectedRestaurant
    );

    useEffect(() => {
        const unsubscribe = listenToRestaurants((restaurants) => {
            setRestaurants(restaurants); // Mettez à jour l'état avec les restaurants en temps réel
            setIsLoading(false); // Arrête le chargement une fois les données reçues
        });

        return () => unsubscribe(); // Nettoyage lors du démontage
    }, []);

    const handleAddRestaurant = async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Vous devez être connecté pour ajouter un restaurant.");
            return;
        }

        if (newRestaurantName && newRestaurantPicture) {
            try {
                const newRestaurant: Restaurant = await addRestaurant(
                    newRestaurantName,
                    newRestaurantPicture
                );
                setRestaurants((prev) => [...prev, newRestaurant]);
                setNewRestaurantName("");
                setNewRestaurantPicture("");
                setIsDialogOpen(false); // Close the dialog

                // Show Sonner notification
                toast("Success", {
                    description: `${newRestaurant.name} a été ajouté avec succès.`,
                });
            } catch (error) {
                console.error("Erreur lors de l'ajout du restaurant:", error);
                alert("Erreur lors de l'ajout du restaurant.");
            }
        }
    };

    const handleSelectRestaurant = (
        restaurantId: string,
        restaurantName: string
    ) => {
        setSelectedRestaurant({ id: restaurantId, name: restaurantName });
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 grow px-4 sm:px-6 py-8">
            {/* Container principal - Glassmorphism Light / Opaque Dark */}
            <Card className="bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none rounded-2xl dark:rounded border border-border/50 dark:border-2 dark:border-primary/30 shadow-2xl dark:shadow-none p-6 sm:p-8 max-w-4xl w-full transition-all duration-200 dark:duration-300">
                {/* Titre avec icône */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex justify-center mb-3">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center ${
                            theme === "light"
                                ? "bg-primary/10 rounded-2xl"
                                : "bg-primary/10 border-2 border-primary/30 rounded-sm"
                        }`}>
                            <FontAwesomeIcon
                                icon={faUtensils}
                                className="text-3xl sm:text-4xl text-primary"
                            />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:font-mono dark:text-primary">
                        {theme === "dark" ? "> SELECT_RESTAURANT" : "Sélectionnez un restaurant"}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground dark:text-primary/60 dark:font-mono mt-2">
                        {theme === "dark" ? "Choose your workspace" : "Choisissez votre espace de travail"}
                    </p>
                </div>

                {/* Grid de restaurants */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {isLoading ? (
                        // Skeleton loader
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted/50 dark:bg-primary/10 rounded-2xl dark:rounded"></div>
                            <div className="mt-2 w-20 h-3 bg-muted/50 dark:bg-primary/10 rounded"></div>
                        </div>
                    ) : (
                        <>
                            {restaurants.map((restaurant: Restaurant) => (
                                <button
                                    key={restaurant.id}
                                    onClick={() =>
                                        handleSelectRestaurant(
                                            restaurant.id,
                                            restaurant.name
                                        )
                                    }
                                    className={`group flex flex-col items-center p-3 sm:p-4 ${
                                        theme === "light"
                                            ? "bg-card/60 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg hover:shadow-2xl hover:scale-105"
                                            : "bg-card/50 dark:backdrop-blur-none rounded border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                                    } transition-all duration-200 dark:duration-300 cursor-pointer`}
                                >
                                    <Avatar className="w-20 h-20 sm:w-28 sm:h-28 ring-2 ring-border/50 dark:ring-primary/30 group-hover:ring-primary transition-all duration-200 dark:duration-300">
                                        <AvatarImage
                                            src={restaurant.picture}
                                            alt={restaurant.name}
                                        />
                                        <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-bold text-xl">
                                            {restaurant.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-center text-sm sm:text-base font-semibold dark:font-mono text-foreground dark:text-primary mt-2 line-clamp-2">
                                        {restaurant.name}
                                    </p>
                                </button>
                            ))}

                            {/* Bouton Ajouter un restaurant */}
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className={`group flex flex-col items-center justify-center p-3 sm:p-4 min-h-[140px] sm:min-h-[180px] ${
                                            theme === "light"
                                                ? "bg-card/60 backdrop-blur-lg rounded-2xl border-2 border-dashed border-border/50 shadow-lg hover:shadow-2xl hover:scale-105 hover:border-primary"
                                                : "bg-card/50 dark:backdrop-blur-none rounded border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                                        } transition-all duration-200 dark:duration-300 cursor-pointer`}
                                    >
                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center ${
                                            theme === "light"
                                                ? "bg-primary/10 rounded-2xl group-hover:bg-primary/20"
                                                : "bg-primary/10 border-2 border-primary/30 rounded-sm group-hover:bg-primary/20"
                                        } transition-all duration-200 dark:duration-300`}>
                                            <FontAwesomeIcon
                                                icon={faPlus}
                                                className="text-2xl sm:text-3xl text-primary group-hover:scale-110 transition-transform"
                                            />
                                        </div>
                                        <p className="text-center text-sm sm:text-base font-semibold dark:font-mono text-muted-foreground dark:text-primary/60 mt-2">
                                            Ajouter
                                        </p>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl dark:bg-card dark:backdrop-blur-none rounded-2xl dark:rounded border-2 border-border/50 dark:border-primary/30">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl dark:font-mono dark:text-primary">
                                            {theme === "dark" ? "> ADD_RESTAURANT" : "Ajouter un restaurant"}
                                        </DialogTitle>
                                        <DialogDescription className="dark:font-mono dark:text-primary/60">
                                            Entrez les informations du restaurant ci-dessous.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name" className="dark:font-mono dark:text-primary">
                                                Nom
                                            </Label>
                                            <Input
                                                id="name"
                                                value={newRestaurantName}
                                                onChange={(e) =>
                                                    setNewRestaurantName(e.target.value)
                                                }
                                                className="dark:font-mono"
                                                placeholder="Ex: La Bella Pizza"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="picture" className="dark:font-mono dark:text-primary">
                                                Image URL
                                            </Label>
                                            <Input
                                                id="picture"
                                                value={newRestaurantPicture}
                                                onChange={(e) =>
                                                    setNewRestaurantPicture(e.target.value)
                                                }
                                                className="dark:font-mono"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddRestaurant} className="dark:font-mono dark:rounded-sm">
                                            Ajouter
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
