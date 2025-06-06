import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faCoins, faListCheck, faCake, faBoxesStacked, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";


export default function ToolsSection() {
    const tools = [
        {
            id: 1,
            title: "Cloture de caisse",
            description:
                "Gérez votre cloture : TPE, cash, Zelty, écarts et pourboires.",
            icon: <FontAwesomeIcon icon={faCashRegister} fixedWidth />,
            comingSoon: false,
            url: "/cloture",
        },
        {
            id: 2,
            title: "Tips calculator",
            description:
                "Calculez et répartissez les pourboires entre les serveurs et la cuisine.",
            icon: <FontAwesomeIcon icon={faCoins}  fixedWidth />,
            comingSoon: false,
            url: "/tipsParty", // URL de l'outil TipsParty
        },
        {
            id: 3,
            title: "Todo list",
            description: "Organisez vos tâches de la journée.",
            icon: <FontAwesomeIcon icon={faListCheck}  fixedWidth />,
            comingSoon: true,
            url: "/todo",
        },
        {
            id: 4,
            title: "Tiramisu",
            description:
                "Suivez le stock de tiramisu et prevenez si y en plus.",
            icon: <FontAwesomeIcon icon={faCake}  fixedWidth />,
            comingSoon: false,
            url: "/tiramisu",
        },
        {
            id: 5,
            title: "Ticket de stock",
            description:
                "Déclarez les manques, suivez leur état et consultez l’historique.",
            icon: <FontAwesomeIcon icon={faBoxesStacked} fixedWidth />,
            comingSoon: false,
            url: "/stocks",
        },
        {
            id: 6,
            title: "Dispo Hebdo",
            description: "Déclarez vos disponibilités ou visualisez le planning de l'équipe.",
            icon: <FontAwesomeIcon icon={faPeopleGroup} fixedWidth />,
            comingSoon: false,
            url: "/dispos",
        },

    ];

    return (
        <div className="p-4 rounded border-2 shadow">
            <h2 className="text-xl font-bold mb-4">Outils</h2>
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
        </div>
    );
}
