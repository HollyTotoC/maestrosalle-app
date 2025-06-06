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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBars, faGauge, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { faCashRegister, faChartPie, faListCheck, faCake, faBoxesStacked } from "@fortawesome/free-solid-svg-icons";
import { DialogTitle } from "./ui/dialog";
import { useUsersStoreSync } from "@/store/useUsersStore";

function UsersStoreSyncer() {
  useUsersStoreSync();
  return null;
}

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
  {
    title: "Disponibilités Hebdo",
    description: "Déclarez vos disponibilités ou visualisez le planning de l'équipe.",
    href: "/dispos",
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

  const handleBackToLanding = () => {
    useAppStore.setState({ selectedRestaurant: null });
  };
  const handleGoToDashboard = () => {
    if (selectedRestaurant) {
      window.location.href = "/dashboard";
    }
  };

  // Ajoute une fonction pour obtenir l'icône du tool
  const getToolIcon = (title: string) => {
    switch (title) {
      case "Clôture de caisse":
        return faCashRegister;
      case "Partage des pourboires":
        return faChartPie;
      case "Todo list":
        return faListCheck;
      case "Tiramisu":
        return faCake;
      case "Stock":
        return faBoxesStacked;
      case "Disponibilités Hebdo":
        return faPeopleGroup;
      default:
        return faListCheck;
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 shadow-sm w-full bg-background border-b-2 border-primary sticky top-0 z-10">
      <UsersStoreSyncer />
      <div className="flex items-center gap-2">
        {selectedRestaurant && (
          <button
            aria-label="Changer de restaurant"
            onClick={handleBackToLanding}
            className="cursor-pointer text-primary hover:text-accent/80 hover:bg-primary transition p-1"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        )}
        <span
          className={`text-xl text-primary/80 font-bold ${selectedRestaurant ? "cursor-pointer hover:text-primary/100" : "cursor-default"}`}
          onClick={handleGoToDashboard}
        >
          {selectedRestaurant ? selectedRestaurant.name : "MaestroSalle"}
        </span>
      </div>

      {selectedRestaurant && (
        <NavigationMenu className="hidden md:flex">
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
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <FontAwesomeIcon icon={getToolIcon(tool.title)} className="w-4 h-4 opacity-80" />
                            {tool.title}
                          </div>
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
            <NavigationMenuItem>
              <NavigationMenuLink href="/team">L&apos;équipe</NavigationMenuLink>
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
              onClick={() => window.location.href = "/profil"}
            >
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-100"
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sheet menu mobile (md-) */}

          <Sheet>
            <SheetTrigger className="md:hidden" asChild>
              <Button size="icon">
                <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-5 sticky h-screen">
              <DialogTitle>MENU</DialogTitle>
              <nav className="flex flex-col gap-2 px-4">
                {selectedRestaurant && (
                  <>
                    <a href="/dashboard" className="text-lg font-semibold py-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faGauge} size="lg" className="w-4 h-4 opacity-80" fixedWidth />
                      Dashboard
                    </a>
                    <div className="font-semibold mt-4 mb-1">Outils</div>
                    <ul className="ml-3 flex flex-col gap-1">
                      {tools.map((tool) => (
                        <li key={tool.title}>
                          <a
                            href={tool.href}
                            className={`flex items-center gap-2 text-base py-2 pl-2 rounded ${tool.comingSoon ? "cursor-not-allowed text-gray-400" : "hover:bg-accent/30"}`}
                            tabIndex={tool.comingSoon ? -1 : 0}
                            {...(tool.comingSoon ? { "aria-disabled": true } : {})}
                          >
                            <FontAwesomeIcon icon={getToolIcon(tool.title)} className="w-4 h-4 opacity-80" />
                            {tool.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <a href="/team" className="text-lg font-semibold py-2 mt-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faPeopleGroup} size="lg" className="w-4 h-4 opacity-80" fixedWidth />
                      L&apos;équipe
                    </a>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
    </nav>
  );
}
