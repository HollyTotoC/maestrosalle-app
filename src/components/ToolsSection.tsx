import { Button } from "@/components/ui/button";

export default function ToolsSection() {
    const tools = [
        {
            id: 1,
            title: "Cloture de caisse",
            description:
                "Gérez votre cloture : TPE, cash, Zelty, écarts et pourboires.",
            icon: "💰",
            comingSoon: false,
            url: "/cloture",
        },
        {
            id: 2,
            title: "Partage des pourboires",
            description:
                "Calculez et répartissez les pourboires entre les serveurs et la cuisine.",
            icon: "💸",
            comingSoon: false,
            url: "/tipsParty", // URL de l'outil TipsParty
        },
        {
            id: 3,
            title: "Todo list",
            description: "Organisez vos tâches de la journée.",
            icon: "✅",
            comingSoon: true,
            url: "/todo",
        },
        {
            id: 4,
            title: "Tiramisu",
            description:
                "Suivez le stock de tiramisu et prevenez si y en plus.",
            icon: "🍰",
            comingSoon: true,
            url: "/tiramisu",
        },
        {
            id: 5,
            title: "Ticket de stock",
            description:
                "Déclarez les manques, suivez leur état et consultez l’historique.",
            icon: "📦",
            comingSoon: false,
            url: "/stocks",
        },

    ];

    return (
        <div className="p-4 bg-gray-100 dark:bg-neutral-900 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Outils</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {tools.map((tool) => (
                    <div
                        key={tool.id}
                        className="p-4 flex flex-col justify-between bg-white dark:bg-neutral-800 rounded-lg shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <span className="text-3xl">{tool.icon}</span>
                            <h3 className="text-lg font-bold">{tool.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {tool.description}
                        </p>
                        <Button
                            className="w-full mt-4 cursor-pointer"
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
                    </div>
                ))}
            </div>
        </div>
    );
}
