"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faHome,
  faArrowLeft,
  faTerminal,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/components/ThemeProvider";

export default function NotFound() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [glitchText, setGlitchText] = useState("404");

  useEffect(() => {
    setMounted(true);

    // Effet glitch pour le mode dark
    if (theme === "dark") {
      const glitchChars = "4█0░4▓";
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          const randomGlitch = Array.from({ length: 3 }, () =>
            glitchChars[Math.floor(Math.random() * glitchChars.length)]
          ).join("");
          setGlitchText(randomGlitch);
          setTimeout(() => setGlitchText("404"), 100);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [theme]);

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-background relative overflow-hidden">
      {/* Background decorations - Mobile optimized */}
      {theme === "light" ? (
        // Light Mode: Floating bubbles/particles - Responsive
        <>
          <div className="absolute top-10 left-10 md:top-20 md:left-20 w-32 h-32 md:w-64 md:h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 md:bottom-20 md:right-20 w-48 h-48 md:w-96 md:h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[600px] md:h-[600px] bg-accent/5 rounded-full blur-3xl animate-spin-slow" />
        </>
      ) : (
        // Dark Mode: Terminal grid/scanlines - Responsive
        <>
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[linear-gradient(to_right,oklch(0.8940_0.0873_200.2091)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.8940_0.0873_200.2091)_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:40px_40px]" />
          </div>
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] opacity-20 pointer-events-none animate-scan" />
          {/* Corner brackets - Responsive */}
          <div className="absolute top-4 left-4 md:top-10 md:left-10 w-12 h-12 md:w-20 md:h-20 border-t-2 border-l-2 border-primary/30" />
          <div className="absolute top-4 right-4 md:top-10 md:right-10 w-12 h-12 md:w-20 md:h-20 border-t-2 border-r-2 border-primary/30" />
          <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 w-12 h-12 md:w-20 md:h-20 border-b-2 border-l-2 border-primary/30" />
          <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 w-12 h-12 md:w-20 md:h-20 border-b-2 border-r-2 border-primary/30" />
        </>
      )}

      {/* Main Content - Mobile optimized */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 max-w-2xl text-center">
        {/* Icon - Different styles */}
        <div className="mb-8">
          {theme === "light" ? (
            // Light: Floating warning icon with shadow
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-xl border-2 border-primary/30 flex items-center justify-center shadow-2xl">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="text-6xl text-primary animate-bounce-slow"
                />
              </div>
            </div>
          ) : (
            // Dark: Terminal error box
            <div className="border-2 border-primary/50 bg-primary/5 px-8 py-6 font-mono">
              <FontAwesomeIcon
                icon={faTerminal}
                className="text-5xl text-primary animate-pulse mb-2"
              />
              <div className="text-xs text-primary/60 mt-2">ERROR_CODE: NOT_FOUND</div>
            </div>
          )}
        </div>

        {/* 404 Number - Mobile responsive */}
        <div className="mb-4 sm:mb-6">
          {theme === "light" ? (
            // Light: Glassmorphic, soft numbers
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black bg-gradient-to-br from-primary via-primary to-secondary bg-clip-text text-transparent drop-shadow-2xl">
              404
            </h1>
          ) : (
            // Dark: Monospace, glitch effect
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-mono font-black text-primary tracking-wider relative">
              <span className="relative z-10">{glitchText}</span>
              <span className="absolute top-0 left-0 text-primary/30 blur-sm -translate-x-1 translate-y-1">
                {glitchText}
              </span>
              <span className="absolute top-0 left-0 text-primary/30 blur-sm translate-x-1 -translate-y-1">
                {glitchText}
              </span>
            </h1>
          )}
        </div>

        {/* Title - Different styles */}
        {theme === "light" ? (
          // Light: Elegant, smooth
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Page introuvable
          </h2>
        ) : (
          // Dark: Terminal-style
          <h2 className="text-2xl md:text-3xl font-mono font-bold text-primary mb-4 tracking-wide">
            &gt; PAGE_NOT_FOUND
          </h2>
        )}

        {/* Description - Different tone */}
        {theme === "light" ? (
          // Light: Friendly message
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Oups ! La page que vous recherchez semble avoir disparu dans les nuages.
            <br className="hidden md:block" />
            Retournons ensemble à un endroit familier.
          </p>
        ) : (
          // Dark: Terminal output
          <div className="font-mono text-sm text-primary/80 mb-8 text-left bg-primary/5 border border-primary/30 p-4 max-w-md">
            <div className="mb-1">
              <span className="text-primary">$</span> maestro locate page
            </div>
            <div className="text-destructive mb-1">ERROR: Resource not found</div>
            <div className="text-primary/60">Status: 404 NOT_FOUND</div>
            <div className="text-primary/60">Suggestion: Return to dashboard</div>
            <div className="mt-2">
              <span className="text-primary animate-pulse">_</span>
            </div>
          </div>
        )}

        {/* Action Buttons - Different styles */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {theme === "light" ? (
            // Light: Rounded, glassmorphic buttons
            <>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                size="lg"
                className="rounded-2xl px-8 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Retour au Dashboard
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                size="lg"
                className="rounded-2xl px-8 border-2 backdrop-blur-sm hover:bg-accent/50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Page précédente
              </Button>
            </>
          ) : (
            // Dark: Terminal-style buttons
            <>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                size="lg"
                className="font-mono uppercase tracking-wider border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary rounded-none px-8 transition-all duration-300 hover:border-primary"
              >
                <FontAwesomeIcon icon={faTerminal} className="mr-2" />
                [DASHBOARD]
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                size="lg"
                className="font-mono uppercase tracking-wider border-2 border-primary/30 bg-transparent hover:bg-primary/5 text-primary/80 hover:text-primary rounded-none px-8 transition-all duration-300 hover:border-primary/50"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                [BACK]
              </Button>
            </>
          )}
        </div>

        {/* Footer hint - Different styles */}
        {theme === "light" ? (
          <p className="mt-12 text-sm text-muted-foreground italic">
            Code erreur: 404 • MaestroSalle v2.0
          </p>
        ) : (
          <div className="mt-12 font-mono text-xs text-primary/50 flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationCircle} className="animate-pulse" />
            <span>SYS.ERR.404 | MAESTRO_OS.v2.0</span>
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
