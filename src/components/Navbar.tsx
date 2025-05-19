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
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Switch } from "@/components/ui/switch";
import { logout } from "@/lib/firebase/client";
import { useUserStore } from "@/store/useUserStore";
import { useTheme } from "@/components/ThemeProvider";

const tools = [
  {
    title: "Clôture de caisse",
    description: "Gérez votre clôture : TPE, cash, Zelty, écarts et pourboires.",
    href: "/cloture",
  },
  {
    title: "Partage des pourboires",
    description: "Calculez et répartissez les pourboires entre les serveurs et la cuisine.",
    href: "/tipsParty",
  },
  {
    title: "Todo list",
    description: "Organisez vos tâches de la journée.",
    href: "/todo",
    comingSoon: true,
  },
  {
    title: "Tiramisu",
    description: "Suivez le stock de tiramisu et prévenez si y en a plus.",
    href: "/tiramisu",
  },
  {
    title: "Stock",
    description: "Suivez le stock manquant.",
    href: "/stocks",
  },
];

export default function Navbar() {
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
  const avatarUrl = useUserStore((state) => state.avatarUrl ?? null);
  const displayName = useUserStore((state) => state.displayName);

  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.map((part) => part[0]).join("").toUpperCase();
  };

  const handleChangeRestaurant = () => {
    useAppStore.setState({ selectedRestaurant: null });
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 shadow-sm dark:shadow-neutral-600 bg-white dark:bg-black w-full sticky top-0 z-10">
      <div className="text-xl font-bold cursor-pointer" onClick={handleChangeRestaurant}>
        {selectedRestaurant ? selectedRestaurant.name : "MaestroSalle"}
      </div>

      {selectedRestaurant && (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/dashboard">Dashboard</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[300px] md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  {tools.map((tool) => (
                    <li key={tool.title}>
                      <NavigationMenuLink asChild>
                        <a
                          href={tool.href}
                          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors ${
                            tool.comingSoon
                              ? "cursor-not-allowed text-gray-400"
                              : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          }`}
                        >
                          <div className="text-sm font-medium leading-none">{tool.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {tool.description}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}

      <div className="flex items-center gap-4">
        <Switch
          checked={theme === "dark"}
          onCheckedChange={toggleTheme}
          aria-label="Toggle dark mode"
        />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={avatarUrl || ""} alt="Avatar" />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
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
