import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faCoins, faListCheck, faCake, faBoxesStacked, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import { SectionSeparatorStack } from "../SectionSeparatorStack";
import { useUserStore } from "@/store/useUserStore";
import { faEnvelopeOpenText } from "@fortawesome/free-solid-svg-icons";
import { useClosuresStore } from "@/store/useClosuresStore";
import { useAppStore } from "@/store/store";
import { useEffect, useMemo, useState } from "react";
import { updateClosuresIfNeeded } from "@/hooks/useClosures";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";


export default function ToolsSection() {
    const userRole = useUserStore((s) => s.role as string | null);
    const isAdmin = useUserStore((s) => s.isAdmin);
    const selectedRestaurant = useAppStore((s) => s.selectedRestaurant);
    const closures = useClosuresStore((s) => s.closures);
    const [open, setOpen] = useState(false);

    // Récupérer les clôtures à jour au chargement si un restaurant est sélectionné
    useEffect(() => {
        if (selectedRestaurant?.id) {
            updateClosuresIfNeeded(selectedRestaurant.id);
        }
    }, [selectedRestaurant?.id]);

    // Vérifier si une clôture existe pour aujourd'hui
    const hasClosureToday = useMemo(() => {
        if (!closures || closures.length === 0) return false;
        const today = new Date();
        return closures.some((closure) => {
            const closureDate = new Date(closure.date.seconds * 1000);
            return (
                closureDate.getFullYear() === today.getFullYear() &&
                closureDate.getMonth() === today.getMonth() &&
                closureDate.getDate() === today.getDate()
            );
        });
    }, [closures]);

    const tools = [
        {
            id: 1,
            title: "Cloture de caisse",
            description:
                "Gérez votre cloture : TPE, cash, Zelty, écarts et pourboires.",
            icon: <FontAwesomeIcon icon={faCashRegister} fixedWidth />,
            comingSoon: false,
            url: "/tools/cloture",
            hide: hasClosureToday,
        },
        {
            id: 2,
            title: "Tips calculator",
            description:
                "Calculez et répartissez les pourboires entre les serveurs et la cuisine.",
            icon: <FontAwesomeIcon icon={faCoins}  fixedWidth />,
            comingSoon: false,
            url: "/tools/tipsParty",
        },
        {
            id: 3,
            title: "Todo list",
            description: "Organisez vos tâches de la journée.",
            icon: <FontAwesomeIcon icon={faListCheck}  fixedWidth />,
            comingSoon: true,
            url: "/tools/todo",
        },
        {
            id: 4,
            title: "Tiramisu",
            description:
                "Suivez le stock de tiramisu et prevenez si y en plus.",
            icon: <FontAwesomeIcon icon={faCake}  fixedWidth />,
            comingSoon: false,
            url: "/tools/tiramisu",
        },
        {
            id: 5,
            title: "Ticket de stock",
            description:
                "Déclarez les manques, suivez leur état et consultez l'historique.",
            icon: <FontAwesomeIcon icon={faBoxesStacked} fixedWidth />,
            comingSoon: false,
            url: "/tools/stocks",
        },
        {
            id: 6,
            title: "Dispo Hebdo",
            description: "Déclarez vos disponibilités ou visualisez le planning de l'équipe.",
            icon: <FontAwesomeIcon icon={faPeopleGroup} fixedWidth />,
            comingSoon: false,
            url: "/tools/dispos",
        },
        {
            id: 7,
            title: "Invitations",
            description: "Générez des codes d'invitation à usage unique pour attribuer un rôle.",
            icon: <FontAwesomeIcon icon={faEnvelopeOpenText} fixedWidth />,
            comingSoon: false,
            url: "/tools/invitations",
            adminOnly: true,
        },
    ].filter(tool => (!tool.adminOnly || isAdmin || userRole === "owner" || userRole === "manager") && !tool.hide);

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="p-4 rounded border-2 shadow">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold mb-0">Outils</h2>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Afficher/masquer les outils">
                        <ChevronDown className={`transition-transform ${open ? '' : '-rotate-90'}`} />
                    </Button>
                </CollapsibleTrigger>
            </div>
            <SectionSeparatorStack space={2} className="mb-2" />
            <CollapsibleContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {tools.map((tool) => (
                        <Card key={tool.id}  className="gap-2">
                            <CardHeader className="flex flex-col md:flex-row items-center gap-2 px-4">
                                <span className="text-3xl">{tool.icon}</span>
                                <CardTitle className="text-lg font-bold">{tool.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 pb-0 px-4">
                                <p className="text-sm mt-2">{tool.description}</p>
                            </CardContent>
                            <CardFooter className=" px-4">
                                <Button
                                    className="w-full cursor-pointer"
                                    variant={tool.comingSoon ? "outline" : undefined}
                                    disabled={tool.comingSoon}
                                    onClick={() => {
                                        if (!tool.comingSoon) {
                                            window.location.href = tool.url;
                                        }
                                    }}
                                >
                                    Accéder
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
