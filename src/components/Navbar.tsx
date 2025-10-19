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
import {
  faHome,
  faBars,
  faGauge,
  faPeopleGroup,
  faCashRegister,
  faChartPie,
  faListCheck,
  faCake,
  faBoxesStacked,
  faCalendarWeek,
  faTicket,
  faUser,
  faPowerOff,
  faMoon,
  faSun,
  faCircle
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { DialogTitle } from "./ui/dialog";
import { useUsersStoreSync } from "@/hooks/useUsersStoreSync";
import { useEffect, useState } from "react";

function UsersStoreSyncer() {
  useUsersStoreSync();
  return null;
}

const tools = [
  {
    title: "Clôture de caisse",
    description: "Gérez votre clôture : TPE, cash, Zelty, écarts et pourboires.",
    href: "/tools/cloture",
    icon: faCashRegister,
    comingSoon: false,
  },
  {
    title: "Partage des pourboires",
    description: "Calculez et répartissez les pourboires entre les serveurs et la cuisine.",
    href: "/tools/tipsParty",
    icon: faChartPie,
    comingSoon: false,
  },
  {
    title: "Todo list",
    description: "Organisez vos tâches de la journée.",
    href: "/tools/todo",
    icon: faListCheck,
    comingSoon: false,
  },
  {
    title: "Tiramisu",
    description: "Suivez le stock de tiramisu et prévenez si y en a plus.",
    href: "/tools/tiramisu",
    icon: faCake,
    comingSoon: false,
  },
  {
    title: "Stock",
    description: "Suivez le stock manquant.",
    href: "/tools/stocks",
    icon: faBoxesStacked,
    comingSoon: false,
  },
  {
    title: "Disponibilités Hebdo",
    description: "Déclarez vos disponibilités ou visualisez le planning de l'équipe.",
    href: "/tools/dispos",
    icon: faCalendarWeek,
    comingSoon: false,
  },
  {
    title: "Invitations",
    description: "Générez des codes d'invitation à usage unique pour attribuer un rôle.",
    href: "/tools/invitations",
    icon: faTicket,
    adminOnly: true,
    comingSoon: false,
  },
];

export default function Navbar() {
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
  const avatarUrl = useUserStore((state) => state.avatarUrl ?? null);
  const displayName = useUserStore((state) => state.displayName);
  const isAdmin = useUserStore((state) => state.isAdmin);
  const role = useUserStore((state) => state.role as string | null);

  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState("");

  // Horloge système pour le mode Dark (OS vibe)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    window.location.href = "/dashboard";
  };

  const handleGoToDashboard = () => {
    if (selectedRestaurant) {
      window.location.href = "/dashboard";
    }
  };

  const filteredTools = tools.filter(
    (tool) => !tool.adminOnly || isAdmin || role === "owner" || role === "manager"
  );

  return (
    <>
      <UsersStoreSyncer />

      {/* DESKTOP NAVBAR - OS Style */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 w-full bg-card/80 backdrop-blur-2xl backdrop-saturate-200 dark:bg-background/95 dark:backdrop-blur-none border-b-2 border-border/30 dark:border-primary/30 shadow-lg dark:shadow-none sticky top-0 z-50 transition-all duration-200 dark:duration-300">

        {/* Left Section - App Icon + Title */}
        <div className="flex items-center gap-4">
          {/* OS App Icon - Circle en Light, Square en Dark */}
          <div className="w-10 h-10 rounded-2xl dark:rounded-sm bg-gradient-to-br from-primary/80 to-primary dark:from-primary/20 dark:to-primary/40 flex items-center justify-center shadow-md dark:shadow-none border-2 border-primary/20 dark:border-primary/50 transition-all duration-200 dark:duration-300">
            <FontAwesomeIcon
              icon={faGauge}
              className="text-primary-foreground dark:text-primary text-lg"
            />
          </div>

          {/* Restaurant Name / App Title */}
          <div className="flex flex-col">
            <span
              className="text-xl font-bold text-foreground dark:font-mono cursor-pointer hover:text-primary transition-colors duration-200"
              onClick={handleGoToDashboard}
            >
              {selectedRestaurant ? selectedRestaurant.name : "MaestroSalle"}
            </span>
            {selectedRestaurant && (
              <span className="text-xs text-muted-foreground dark:text-primary/60 dark:font-mono">
                v2.0-beta
              </span>
            )}
          </div>
        </div>

        {/* Center Section - Navigation Menu (macOS style en Light, Terminal menu en Dark) */}
        {selectedRestaurant && (
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {/* Dashboard */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl dark:rounded-sm text-sm font-medium hover:bg-accent/50 dark:hover:bg-primary/10 dark:text-primary dark:border dark:border-primary/30 transition-all duration-200 dark:duration-300 dark:font-mono flex flex-row items-center"
                >
                  <FontAwesomeIcon icon={faGauge} className="mr-2 w-4 h-4" />
                  Dashboard
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Tools Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-4 py-2 rounded-xl dark:rounded-sm text-sm font-medium dark:font-mono dark:border dark:border-primary/30 dark:text-primary transition-all duration-200 dark:duration-300">
                  Tools
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-2 p-4 w-[400px] lg:w-[500px] lg:grid-cols-2 bg-card/95 backdrop-blur-xl dark:bg-background/98 dark:backdrop-blur-none rounded-2xl dark:rounded-sm border-2 border-border/50 dark:border-primary/30 shadow-2xl dark:shadow-none">
                    {filteredTools.map((tool) => (
                      <li key={tool.title}>
                        <NavigationMenuLink asChild>
                          <a
                            href={tool.href}
                            className="block select-none space-y-1 rounded-xl dark:rounded-sm p-3 leading-none no-underline outline-none transition-all duration-200 dark:duration-300 hover:bg-accent/50 dark:hover:bg-primary/10 dark:border dark:border-transparent dark:hover:border-primary/50 focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none dark:font-mono dark:text-primary">
                              <FontAwesomeIcon icon={tool.icon} className="w-4 h-4" />
                              {tool.title}
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground dark:text-primary/60 dark:font-mono">
                              {tool.description}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Team */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/team"
                  className="px-4 py-2 rounded-xl dark:rounded-sm text-sm font-medium hover:bg-accent/50 dark:hover:bg-primary/10 dark:text-primary dark:border dark:border-primary/30 transition-all duration-200 dark:duration-300 dark:font-mono flex flex-row items-center"
                >
                  <FontAwesomeIcon icon={faPeopleGroup} className="mr-2 w-4 h-4" />
                  L&apos;équipe
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {/* Right Section - System Tray (iOS style en Light, Terminal status en Dark) */}
        <div className="flex items-center gap-3">
          {/* System Clock (Dark mode only - Terminal vibe) */}
          {theme === "dark" && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-sm border border-primary/30 bg-primary/5">
              <FontAwesomeIcon icon={faCircle} className="w-2 h-2 text-primary animate-pulse" />
              <span className="text-xs font-mono text-primary">{currentTime}</span>
            </div>
          )}

          {/* Theme Toggle - Different styles */}
          <button
            onClick={toggleTheme}
            className="group relative w-14 h-7 rounded-full dark:rounded-sm bg-muted dark:bg-primary/10 border-2 border-border/50 dark:border-primary/30 transition-all duration-200 dark:duration-300 hover:scale-105 dark:hover:scale-100 dark:hover:border-primary/50"
            aria-label="Toggle theme"
          >
            <div className={`absolute top-0.5 ${theme === "dark" ? "right-0.5" : "left-0.5"} w-6 h-6 rounded-full dark:rounded-sm bg-primary dark:bg-primary/80 flex items-center justify-center transition-all duration-200 dark:duration-300 shadow-md dark:shadow-none`}>
              <FontAwesomeIcon
                icon={theme === "dark" ? faMoon : faSun}
                className="w-3 h-3 text-primary-foreground"
              />
            </div>
          </button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="w-9 h-9 ring-2 ring-border/50 dark:ring-primary/30 hover:ring-primary dark:hover:ring-primary/60 transition-all duration-200 cursor-pointer">
                <AvatarImage src={avatarUrl || ""} alt="Avatar" />
                <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold dark:font-mono">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-card/95 backdrop-blur-xl dark:bg-background/98 dark:backdrop-blur-none rounded-2xl dark:rounded-sm border-2 border-border/50 dark:border-primary/30 shadow-2xl dark:shadow-none p-2"
            >
              <div className="px-3 py-2 mb-2 border-b border-border/50 dark:border-primary/20">
                <p className="text-sm font-medium dark:font-mono dark:text-primary">{displayName}</p>
                <p className="text-xs text-muted-foreground dark:text-primary/60 dark:font-mono">{role || "Utilisateur"}</p>
              </div>
              <DropdownMenuItem
                onClick={() => window.location.href = "/profil"}
                className="rounded-xl dark:rounded-sm cursor-pointer dark:font-mono dark:text-primary/80 dark:hover:bg-primary/10 dark:hover:text-primary transition-all duration-200"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2 w-4 h-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl dark:rounded-sm cursor-pointer text-destructive dark:text-red-400 hover:bg-destructive/10 dark:hover:bg-red-500/10 dark:font-mono transition-all duration-200"
              >
                <FontAwesomeIcon icon={faPowerOff} className="mr-2 w-4 h-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Back Button (if restaurant selected) */}
          {selectedRestaurant && (
            <button
              onClick={handleBackToLanding}
              className="px-3 py-2 rounded-xl dark:rounded-sm bg-muted/50 dark:bg-primary/5 hover:bg-muted dark:hover:bg-primary/10 border-2 border-border/50 dark:border-primary/30 transition-all duration-200 dark:duration-300 dark:hover:border-primary/50 group"
              aria-label="Retour à la sélection de restaurant"
            >
              <FontAwesomeIcon
                icon={faHome}
                className="text-muted-foreground dark:text-primary group-hover:text-foreground dark:group-hover:text-primary group-hover:scale-110 transition-all duration-300"
              />
            </button>
          )}
        </div>
      </nav>

      {/* MOBILE NAVBAR - App Drawer Style */}
      <nav className="flex md:hidden items-center justify-between px-4 py-3 w-full bg-card/90 backdrop-blur-2xl backdrop-saturate-200 dark:bg-background/95 dark:backdrop-blur-none border-b-2 border-border/30 dark:border-primary/40 shadow-lg dark:shadow-none sticky top-0 z-50 transition-all duration-200 dark:duration-300">

        {/* Mobile Left - Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl dark:rounded-sm dark:border dark:border-primary/30 dark:hover:bg-primary/10 dark:text-primary"
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] bg-card/95 backdrop-blur-2xl dark:bg-background/98 dark:backdrop-blur-none border-r-2 border-border/50 dark:border-primary/30 p-0"
          >
            {/* Drawer Header - OS Style */}
            <div className="px-6 py-5 border-b-2 border-border/50 dark:border-primary/30 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10">
              <DialogTitle className="text-xl font-bold dark:font-mono dark:text-primary flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl dark:rounded-sm bg-primary dark:bg-primary/20 flex items-center justify-center border-2 border-primary/20 dark:border-primary/50">
                  <FontAwesomeIcon icon={faGauge} className="text-primary-foreground dark:text-primary text-sm" />
                </div>
                MENU
              </DialogTitle>
              {theme === "dark" && (
                <p className="text-xs font-mono text-primary/60 mt-1">system.maestro.v2</p>
              )}
            </div>

            {/* Drawer Content */}
            <nav className="flex flex-col gap-1 p-4">
              {selectedRestaurant && (
                <>
                  {/* Dashboard */}
                  <a
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl dark:rounded-sm hover:bg-accent/50 dark:hover:bg-primary/10 dark:border dark:border-transparent dark:hover:border-primary/50 transition-all duration-200 dark:duration-300 group"
                  >
                    <FontAwesomeIcon
                      icon={faGauge}
                      className="w-5 h-5 text-primary dark:text-primary/80 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-base font-semibold dark:font-mono dark:text-primary">Dashboard</span>
                  </a>

                  {/* Tools Section */}
                  <div className="mt-4 mb-2 px-4">
                    <span className="text-xs font-bold text-muted-foreground dark:text-primary/50 dark:font-mono uppercase tracking-wider">
                      {theme === "dark" ? "> Applications" : "Applications"}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-1">
                    {filteredTools.map((tool) => (
                      <li key={tool.title}>
                        <a
                          href={tool.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl dark:rounded-sm hover:bg-accent/50 dark:hover:bg-primary/10 dark:border dark:border-transparent dark:hover:border-primary/50 transition-all duration-200 dark:duration-300 group"
                        >
                          <FontAwesomeIcon
                            icon={tool.icon}
                            className="w-4 h-4 text-primary dark:text-primary/80 group-hover:scale-110 transition-transform"
                          />
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium dark:font-mono dark:text-primary">{tool.title}</span>
                            {theme === "light" && (
                              <span className="text-xs text-muted-foreground line-clamp-1">{tool.description}</span>
                            )}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>

                  {/* Team */}
                  <a
                    href="/team"
                    className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl dark:rounded-sm hover:bg-accent/50 dark:hover:bg-primary/10 dark:border dark:border-transparent dark:hover:border-primary/50 transition-all duration-200 dark:duration-300 group"
                  >
                    <FontAwesomeIcon
                      icon={faPeopleGroup}
                      className="w-5 h-5 text-primary dark:text-primary/80 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-base font-semibold dark:font-mono dark:text-primary">L&apos;équipe</span>
                  </a>
                </>
              )}
            </nav>

            {/* Drawer Footer - System Info (Dark mode) */}
            {theme === "dark" && (
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t-2 border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between text-xs font-mono text-primary/60">
                  <span>SYS: OK</span>
                  <span>{currentTime}</span>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Mobile Center - Restaurant Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl dark:rounded-sm bg-gradient-to-br from-primary/80 to-primary dark:from-primary/20 dark:to-primary/40 flex items-center justify-center shadow-md dark:shadow-none border-2 border-primary/20 dark:border-primary/50">
            <FontAwesomeIcon icon={faGauge} className="text-primary-foreground dark:text-primary text-sm" />
          </div>
          <span
            className="text-lg font-bold text-foreground dark:font-mono dark:text-primary cursor-pointer"
            onClick={handleGoToDashboard}
          >
            {selectedRestaurant ? selectedRestaurant.name : "MaestroSalle"}
          </span>
        </div>

        {/* Mobile Right - Back to Landing + Theme + Avatar */}
        <div className="flex items-center gap-2">
          {selectedRestaurant && (
            <button
              onClick={handleBackToLanding}
              className="w-9 h-9 rounded-xl dark:rounded-sm bg-muted/50 dark:bg-primary/5 hover:bg-muted dark:hover:bg-primary/10 border-2 border-border/50 dark:border-primary/30 flex items-center justify-center transition-all duration-200 dark:duration-300 dark:hover:border-primary/50 group"
              aria-label="Retour à la sélection de restaurant"
            >
              <FontAwesomeIcon
                icon={faHome}
                className="w-4 h-4 text-muted-foreground dark:text-primary group-hover:text-foreground dark:group-hover:text-primary group-hover:scale-110 transition-all duration-300"
              />
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl dark:rounded-sm bg-muted dark:bg-primary/10 border-2 border-border/50 dark:border-primary/30 flex items-center justify-center transition-all duration-200 dark:duration-300"
            aria-label="Toggle theme"
          >
            <FontAwesomeIcon
              icon={theme === "dark" ? faMoon : faSun}
              className="w-4 h-4 text-primary"
            />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="w-9 h-9 ring-2 ring-border/50 dark:ring-primary/30">
                <AvatarImage src={avatarUrl || ""} alt="Avatar" />
                <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold dark:font-mono text-xs">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-card/95 backdrop-blur-xl dark:bg-background/98 dark:backdrop-blur-none rounded-2xl dark:rounded-sm border-2 border-border/50 dark:border-primary/30 shadow-2xl dark:shadow-none"
            >
              <div className="px-3 py-2 mb-2 border-b border-border/50 dark:border-primary/20">
                <p className="text-sm font-medium dark:font-mono dark:text-primary truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground dark:text-primary/60 dark:font-mono">{role || "User"}</p>
              </div>
              <DropdownMenuItem
                onClick={() => window.location.href = "/profil"}
                className="rounded-xl dark:rounded-sm cursor-pointer dark:font-mono dark:text-primary/80 dark:hover:bg-primary/10"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2 w-4 h-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl dark:rounded-sm cursor-pointer text-destructive dark:text-red-400 hover:bg-destructive/10 dark:hover:bg-red-500/10 dark:font-mono"
              >
                <FontAwesomeIcon icon={faPowerOff} className="mr-2 w-4 h-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}
