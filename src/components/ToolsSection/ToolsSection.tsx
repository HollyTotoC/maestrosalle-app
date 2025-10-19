import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faCoins, faListCheck, faCake, faBoxesStacked, faPeopleGroup, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
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
            bgColor: "from-green-400 to-green-600",
            lightIconColor: "text-white",
        },
        {
            id: 2,
            title: "Tips calculator",
            description:
                "Calculez et répartissez les pourboires entre les serveurs et la cuisine.",
            icon: <FontAwesomeIcon icon={faCoins}  fixedWidth />,
            comingSoon: false,
            url: "/tools/tipsParty",
            bgColor: "from-yellow-400 to-amber-600",
            lightIconColor: "text-white",
        },
        {
            id: 3,
            title: "Todo list",
            description: "Organisez vos tâches de la journée.",
            icon: <FontAwesomeIcon icon={faListCheck}  fixedWidth />,
            comingSoon: false,
            url: "/tools/todo",
            bgColor: "from-blue-400 to-blue-600",
            lightIconColor: "text-white",
        },
        {
            id: 4,
            title: "Tiramisu",
            description:
                "Suivez le stock de tiramisu et prevenez si y en plus.",
            icon: <FontAwesomeIcon icon={faCake}  fixedWidth />,
            comingSoon: false,
            url: "/tools/tiramisu",
            bgColor: "from-pink-400 to-rose-600",
            lightIconColor: "text-white",
        },
        {
            id: 5,
            title: "Ticket de stock",
            description:
                "Déclarez les manques, suivez leur état et consultez l'historique.",
            icon: <FontAwesomeIcon icon={faBoxesStacked} fixedWidth />,
            comingSoon: false,
            url: "/tools/stocks",
            bgColor: "from-orange-400 to-orange-600",
            lightIconColor: "text-white",
        },
        {
            id: 6,
            title: "Dispo Hebdo",
            description: "Déclarez vos disponibilités ou visualisez le planning de l'équipe.",
            icon: <FontAwesomeIcon icon={faPeopleGroup} fixedWidth />,
            comingSoon: false,
            url: "/tools/dispos",
            bgColor: "from-purple-400 to-purple-600",
            lightIconColor: "text-white",
        },
        {
            id: 7,
            title: "Invitations",
            description: "Générez des codes d'invitation à usage unique pour attribuer un rôle.",
            icon: <FontAwesomeIcon icon={faEnvelopeOpenText} fixedWidth />,
            comingSoon: false,
            url: "/tools/invitations",
            adminOnly: true,
            bgColor: "from-red-400 to-red-600",
            lightIconColor: "text-white",
        },
    ].filter(tool => (!tool.adminOnly || isAdmin || userRole === "owner" || userRole === "manager") && !tool.hide);

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-6 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faScrewdriverWrench} className="text-primary" />
                    Outils
                </h2>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-accent/50 transition-all duration-200" aria-label="Afficher/masquer les outils">
                        <ChevronDown className={`transition-transform duration-300 ${open ? '' : '-rotate-90'}`} />
                    </Button>
                </CollapsibleTrigger>
            </div>
            <SectionSeparatorStack space={2} className="mb-2 hidden dark:block" />
            <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                {/* Light Mode : Style iPhone apps (gros icônes avec couleurs iOS) */}
                <div className="dark:hidden grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mt-4">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => {
                                if (!tool.comingSoon) {
                                    window.location.href = tool.url;
                                }
                            }}
                            disabled={tool.comingSoon}
                            className={`group relative bg-gradient-to-br ${tool.bgColor} rounded-3xl p-4 flex flex-col items-center gap-2 transition-all duration-200 shadow-md ${
                                tool.comingSoon
                                    ? "opacity-40 cursor-not-allowed"
                                    : "cursor-pointer hover:scale-110 active:scale-95 hover:shadow-xl"
                            }`}
                        >
                            <div className={`text-4xl ${tool.lightIconColor} transition-transform duration-200 ${!tool.comingSoon && "group-hover:scale-110"}`}>
                                {tool.icon}
                            </div>
                            <span className="text-xs font-semibold text-white text-center line-clamp-2">{tool.title}</span>
                        </button>
                    ))}
                </div>

                {/* Dark Mode : Style minimaliste (avec description) */}
                <div className="hidden dark:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 mt-4">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={() => {
                                if (!tool.comingSoon) {
                                    window.location.href = tool.url;
                                }
                            }}
                            className={`group relative bg-card/80 backdrop-blur-md backdrop-saturate-150 rounded border border-border/50 p-4 flex flex-col items-center gap-3 transition-all duration-300 ${
                                tool.comingSoon
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:bg-primary/10 hover:border-primary/40 hover:shadow-xl hover:scale-105 active:scale-95"
                            }`}
                        >
                            <div className={`text-4xl transition-all duration-300 ${!tool.comingSoon && "group-hover:scale-110 group-hover:text-primary"}`}>
                                {tool.icon}
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
