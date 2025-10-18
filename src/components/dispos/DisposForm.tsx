"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import type { DispoDay, DispoPreference, UserDispos } from "@/types/dispos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import { Checkbox } from "@/components/ui/checkbox";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useUserStore } from "@/store/useUserStore";

const jours = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
];
const preferenceOptions = [
    { value: "journée", label: "Journée complète" },
    { value: "demi", label: "Demi-journée" },
    { value: "aucune", label: "Sans préférence" },
];

// Correction : typage strict des props du composant DisposForm
interface DisposFormProps {
    initialData?: UserDispos;
    onSubmit: (data: UserDispos) => void;
}

const DisposForm: React.FC<DisposFormProps> = ({ initialData, onSubmit }) => {
    // Semaine sélectionnée (par défaut semaine courante, toujours lundi)
    const [semaine, setSemaine] = useState(() => {
        const today = new Date();
        // On veut le lundi de la semaine courante OU prochaine si on est dimanche
        const day = today.getDay();
        // Si dimanche (0), on passe au lundi suivant
        if (day === 0) {
            today.setDate(today.getDate() + 1);
        } else {
            today.setDate(today.getDate() - (day - 1));
        }
        today.setHours(0, 0, 0, 0);
        return today;
    });
    // Nombre de shifts souhaités
    const [shiftsSouhaites, setShiftsSouhaites] = useState(
        initialData?.shiftsSouhaites || 5
    );
    // Préférence
    const [preference, setPreference] = useState<DispoPreference>(
        initialData?.preference || "aucune"
    );
    // Dispos par jour/shift
    const [disponibilites, setDisponibilites] = useState<{
        [dateISO: string]: DispoDay;
    }>(() => {
        const base: { [dateISO: string]: DispoDay } = {};
        const monday = new Date(semaine);
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const iso = d.toISOString().slice(0, 10);
            base[iso] = {
                midi: { dispo: false, priorite: 1 },
                soir: { dispo: false, priorite: 1 },
            };
        }
        return initialData?.disponibilites || base;
    });

    // Gestion des changements
    const handleDispoChange = (
        dateISO: string,
        shift: "midi" | "soir",
        field: "dispo" | "priorite",
        value: boolean | number
    ) => {
        setDisponibilites((prev) => ({
            ...prev,
            [dateISO]: {
                ...prev[dateISO],
                [shift]: {
                    ...prev[dateISO][shift],
                    [field]: value,
                },
            },
        }));
    };

    // Semaine suivante/précédente
    const handleChangeSemaine = (offset: number) => {
        setSemaine((prev) => {
            const d = new Date(prev);
            d.setDate(prev.getDate() + offset * 7);
            d.setHours(0, 0, 0, 0);
            return d;
        });
    };

    // Soumission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            role: initialData?.role || "CDI",
            shiftsSouhaites,
            preference,
            disponibilites,
            semaineStart: monday,
            semaineEnd: weekDates[6],
        });
    };

    // Génère les dates de la semaine sélectionnée (toujours lundi-dimanche)
    const monday = new Date(semaine);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    // Ajout : chargement des dispos Firestore pour la semaine et l'utilisateur
    const userId = useUserStore((state) => state.userId);
    useEffect(() => {
        async function fetchUserDispos() {
            if (!userId) {
                return;
            }
            const semaineUid = semaine.toISOString().slice(0, 10);
            const userRef = doc(db, `disponibilites/${semaineUid}/users`, userId);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                const data = snap.data() as UserDispos;
                setShiftsSouhaites(data.shiftsSouhaites || 5);
                setPreference(data.preference || "aucune");
                setDisponibilites(data.disponibilites || {});
            } else {
                // Reset si pas de données
                const base: { [dateISO: string]: DispoDay } = {};
                const monday = new Date(semaine);
                for (let i = 0; i < 7; i++) {
                    const d = new Date(monday);
                    d.setDate(monday.getDate() + i);
                    const iso = d.toISOString().slice(0, 10);
                    base[iso] = {
                        midi: { dispo: false, priorite: 1 },
                        soir: { dispo: false, priorite: 1 },
                    };
                }
                setShiftsSouhaites(5);
                setPreference("aucune");
                setDisponibilites(base);
            }
        }
        fetchUserDispos();
    }, [semaine, userId]);

    // Découpage des jours pour le wrap mobile : 4 premiers jours puis 3 suivants
    const joursLigne1 = jours.slice(0, 4);
    const joursLigne2 = jours.slice(4);
    const weekDatesLigne1 = weekDates.slice(0, 4);
    const weekDatesLigne2 = weekDates.slice(4);

    return (
        <>
            <div className="mb-6 flex items-center gap-3">
                <span className="text-2xl text-primary">
                    <FontAwesomeIcon icon={faPeopleGroup} />
                </span>
                <div>
                    <h2 className="text-xl font-bold leading-tight">
                        Disponibilités Hebdo
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Déclarez vos disponibilités pour la semaine à venir. Les
                        managers visualisent le planning global de l’équipe.
                    </p>
                </div>
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardContent className="px-6 py-2">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="flex items-center justify-center w-full gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleChangeSemaine(-1)}
                                aria-label="Semaine précédente"
                            >
                                &lt;
                            </Button>
                            <span className="font-semibold">
                                {weekDates[0].toLocaleDateString()} au{" "}
                                {weekDates[6].toLocaleDateString()}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleChangeSemaine(1)}
                                aria-label="Semaine suivante"
                            >
                                &gt;
                            </Button>
                        </div>
                        <div className="flex justify-between gap-4">
                            <div>
                                <Label htmlFor="shiftsSouhaites" className="block mb-2">
                                    Shifts souhaités
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        aria-label="Retirer un shift"
                                        onClick={() =>
                                            setShiftsSouhaites((v) =>
                                                Math.max(1, v - 1)
                                            )
                                        }
                                    >
                                        -
                                    </Button>
                                    <Input
                                        id="shiftsSouhaites"
                                        type="number"
                                        min={1}
                                        max={14}
                                        value={shiftsSouhaites}
                                        onChange={(e) =>
                                            setShiftsSouhaites(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-16 text-center"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        aria-label="Ajouter un shift"
                                        onClick={() =>
                                            setShiftsSouhaites((v) =>
                                                Math.min(14, v + 1)
                                            )
                                        }
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="preference" className="block mb-2">
                                    Préférence de disponibilité
                                </Label>
                                <select
                                    id="preference"
                                    value={preference}
                                    onChange={(e) =>
                                        setPreference(
                                            e.target.value as DispoPreference
                                        )
                                    }
                                    className="border rounded px-2 py-1"
                                    title="Préférence de disponibilité"
                                >
                                    {preferenceOptions.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="w-full">
                            {/* Tableau complet : desktop (md+) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full border text-sm bg-white dark:bg-zinc-900 rounded shadow">
                                    <thead>
                                        <tr>
                                            <th className="border px-2 py-1 bg-muted/60">
                                                &nbsp;
                                            </th>
                                            {jours.map((jour) => (
                                                <th
                                                    key={jour}
                                                    className="border px-2 py-1 text-center bg-muted/60 font-semibold"
                                                >
                                                    {jour}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {["midi", "soir"].map((shift) => (
                                            <tr key={shift}>
                                                <td className="border px-2 py-1 font-semibold text-right bg-muted/40">
                                                    {shift === "midi"
                                                        ? "Midi"
                                                        : "Soir"}
                                                </td>
                                                {weekDates.map((date) => {
                                                    const iso = date
                                                        .toISOString()
                                                        .slice(0, 10);
                                                    const s = shift as
                                                        | "midi"
                                                        | "soir";
                                                    return (
                                                        <td
                                                            key={iso}
                                                            className="border px-2 py-1 text-center align-middle"
                                                        >
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Checkbox
                                                                    checked={
                                                                        disponibilites[
                                                                            iso
                                                                        ]?.[s].dispo
                                                                    }
                                                                    onCheckedChange={(checked) =>
                                                                        handleDispoChange(
                                                                            iso,
                                                                            s,
                                                                            "dispo",
                                                                            !!checked
                                                                        )
                                                                    }
                                                                    aria-label={`Disponible ${shift}`}
                                                                />
                                                                <select
                                                                    title={`Priorité ${shift}`}
                                                                    value={
                                                                        disponibilites[
                                                                            iso
                                                                        ]?.[s]
                                                                            .priorite
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleDispoChange(
                                                                            iso,
                                                                            s,
                                                                            "priorite",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        )
                                                                    }
                                                                    className="w-full mt-1"
                                                                >
                                                                    <option
                                                                        value={1}
                                                                    >
                                                                        Forte
                                                                    </option>
                                                                    <option
                                                                        value={2}
                                                                    >
                                                                        Normale
                                                                    </option>
                                                                    <option
                                                                        value={3}
                                                                    >
                                                                        Faible
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Tableau wrap en 2 lignes : mobile (md-) */}
                            <div className="block md:hidden overflow-x-auto w-full">
                                {/* Ligne 1 : lundi à jeudi */}
                                <table className="min-w-full border text-sm bg-white dark:bg-zinc-900 rounded shadow mb-4">
                                    <thead>
                                        <tr>
                                            <th className="border px-2 py-1 bg-muted/60">
                                                &nbsp;
                                            </th>
                                            {joursLigne1.map((jour) => (
                                                <th
                                                    key={jour}
                                                    className="border px-2 py-1 text-center bg-muted/60 font-semibold"
                                                >
                                                    {jour}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {["midi", "soir"].map((shift) => (
                                            <tr key={shift}>
                                                <td className="border px-2 py-1 font-semibold text-right bg-muted/40">
                                                    {shift === "midi"
                                                        ? "Midi"
                                                        : "Soir"}
                                                </td>
                                                {weekDatesLigne1.map((date) => {
                                                    const iso = date
                                                        .toISOString()
                                                        .slice(0, 10);
                                                    const s = shift as
                                                        | "midi"
                                                        | "soir";
                                                    return (
                                                        <td
                                                            key={iso}
                                                            className="border px-2 py-1 text-center align-middle"
                                                        >
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Checkbox
                                                                    checked={
                                                                        disponibilites[
                                                                            iso
                                                                        ]?.[s].dispo
                                                                    }
                                                                    onCheckedChange={(checked) =>
                                                                        handleDispoChange(
                                                                            iso,
                                                                            s,
                                                                            "dispo",
                                                                            !!checked
                                                                        )
                                                                    }
                                                                    aria-label={`Disponible ${shift}`}
                                                                />
                                                                <select
                                                                    title={`Priorité ${shift}`}
                                                                    value={
                                                                        disponibilites[
                                                                            iso
                                                                        ]?.[s]
                                                                            .priorite
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleDispoChange(
                                                                            iso,
                                                                            s,
                                                                            "priorite",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        )
                                                                    }
                                                                    className="w-full mt-1"
                                                                >
                                                                    <option
                                                                        value={1}
                                                                    >
                                                                        Forte
                                                                    </option>
                                                                    <option
                                                                        value={2}
                                                                    >
                                                                        Normale
                                                                    </option>
                                                                    <option
                                                                        value={3}
                                                                    >
                                                                        Faible
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Ligne 2 : vendredi à dimanche */}
                                <table className="min-w-full border text-sm bg-white dark:bg-zinc-900 rounded shadow">
                                    <thead>
                                        <tr>
                                            <th className="border px-2 py-1 bg-muted/60">
                                                &nbsp;
                                            </th>
                                            {joursLigne2.map((jour) => (
                                                <th
                                                    key={jour}
                                                    className="border px-2 py-1 text-center bg-muted/60 font-semibold"
                                                >
                                                    {jour}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {["midi", "soir"].map((shift) => (
                                            <tr key={shift}>
                                                <td className="border px-2 py-1 font-semibold text-right bg-muted/40">
                                                    {shift === "midi"
                                                        ? "Midi"
                                                        : "Soir"}
                                                </td>
                                                {weekDatesLigne2.map((date) => {
                                                    const iso = date
                                                        .toISOString()
                                                        .slice(0, 10);
                                                    const s = shift as
                                                        | "midi"
                                                        | "soir";
                                                    return (
                                                        <td
                                                            key={iso}
                                                            className="border px-2 py-1 text-center align-middle"
                                                        >
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Checkbox
                                                                    checked={
                                                                        disponibilites[
                                                                            iso
                                                                        ]?.[s].dispo
                                                                    }
                                                                    onCheckedChange={(checked) =>
                                                                        handleDispoChange(
                                                                            iso,
                                                                            s,
                                                                            "dispo",
                                                                            !!checked
                                                                        )
                                                                    }
                                                                    aria-label={`Disponible ${shift}`}
                                                                />
                                                                <select
                                                                    title={`Priorité ${shift}`}
                                                                    value={
                                                                        disponibilites[
                                                                            iso
                                                                        ]?.[s]
                                                                            .priorite
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleDispoChange(
                                                                            iso,
                                                                            s,
                                                                            "priorite",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        )
                                                                    }
                                                                    className="w-full mt-1"
                                                                >
                                                                    <option
                                                                        value={1}
                                                                    >
                                                                        Forte
                                                                    </option>
                                                                    <option
                                                                        value={2}
                                                                    >
                                                                        Normale
                                                                    </option>
                                                                    <option
                                                                        value={3}
                                                                    >
                                                                        Faible
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" className="mt-4">
                                Soumettre mes dispos
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
};

export default DisposForm;
