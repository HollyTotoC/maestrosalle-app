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
import { toast } from "sonner"; // Import Sonner's toast function

import { fetchRestaurants, addRestaurant, auth } from "@/lib/firebase";
import { useAppStore } from "@/store/store";

interface Restaurant {
    id: string;
    name: string;
    picture: string;
}

export default function RestaurantSelector() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [newRestaurantName, setNewRestaurantName] = useState("");
    const [newRestaurantPicture, setNewRestaurantPicture] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const setSelectedRestaurant = useAppStore(
        (state) => state.setSelectedRestaurant
    );

    useEffect(() => {
        const loadRestaurants = async () => {
            const data = await fetchRestaurants();
            setRestaurants(data);
        };
        loadRestaurants();
    }, []);

    const handleAddRestaurant = async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Vous devez être connecté pour ajouter un restaurant.");
            return;
        }

        if (newRestaurantName && newRestaurantPicture) {
            try {
                const newRestaurant = await addRestaurant(
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

    const handleSelectRestaurant = (name: string) => {
        setSelectedRestaurant(name);
    };

    return (
        <div className="flex flex-col justify-center items-center gap-8 grow">
            <h1 className="text-2xl font-bold">Sélectionnez un restaurant</h1>
            <div className="flex gap-4">
                {restaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        className="cursor-pointer"
                        onClick={() => handleSelectRestaurant(restaurant.name)}
                    >
                        <Avatar className="w-40 h-40">
                            <AvatarImage
                                src={restaurant.picture}
                                alt={restaurant.name}
                            />
                            <AvatarFallback>{restaurant.name}</AvatarFallback>
                        </Avatar>
                        <p className="text-center text-2xl font-semibold">{restaurant.name}</p>
                    </div>
                ))}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                            <Avatar className="w-40 h-40">
                                <AvatarImage
                                    src="/path/to/plus-icon.png"
                                    alt="Ajouter"
                                />
                                <AvatarFallback className="text-2xl font-semibold">+</AvatarFallback>
                            </Avatar>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter un restaurant</DialogTitle>
                            <DialogDescription>
                                Entrez les informations du restaurant
                                ci-dessous.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nom
                                </Label>
                                <Input
                                    id="name"
                                    value={newRestaurantName}
                                    onChange={(e) =>
                                        setNewRestaurantName(e.target.value)
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="picture" className="text-right">
                                    Image URL
                                </Label>
                                <Input
                                    id="picture"
                                    value={newRestaurantPicture}
                                    onChange={(e) =>
                                        setNewRestaurantPicture(e.target.value)
                                    }
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddRestaurant}>
                                Ajouter
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
