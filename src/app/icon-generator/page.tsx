"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPizzaSlice,
  faUtensils,
  faStore,
  faBurger,
  faCoffee,
  faIceCream,
  faWineGlass,
  faBowlFood,
  faClipboardList,
  faCashRegister,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

const ICONS: { icon: IconDefinition; label: string }[] = [
  { icon: faPizzaSlice, label: "Pizza" },
  { icon: faUtensils, label: "Couverts" },
  { icon: faStore, label: "Restaurant" },
  { icon: faBurger, label: "Burger" },
  { icon: faCoffee, label: "Café" },
  { icon: faIceCream, label: "Dessert" },
  { icon: faWineGlass, label: "Vin" },
  { icon: faBowlFood, label: "Plat" },
  { icon: faClipboardList, label: "Gestion" },
  { icon: faCashRegister, label: "Caisse" },
];

const SHAPES = [
  { value: "square", label: "Carré" },
  { value: "rounded", label: "Arrondi" },
  { value: "circle", label: "Cercle" },
];

export default function IconGenerator() {
  const [bgColor, setBgColor] = useState("#ffffff");
  const [iconColor, setIconColor] = useState("#8b5cf6");
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [shape, setShape] = useState("rounded");
  const [previews, setPreviews] = useState<{ [key: number]: string }>({});

  // Fonction pour dessiner une forme arrondie
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Générer une icône pour une taille donnée
  const generateIcon = (size: number): string => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Fond
    ctx.fillStyle = bgColor;

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "rounded") {
      roundRect(ctx, 0, 0, size, size, size * 0.15);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    // Récupérer l'icône FontAwesome
    const faIcon = ICONS[selectedIcon].icon;
    const svgPathData = faIcon.icon[4]; // Le path SVG
    const viewBox = faIcon.icon[0]; // Largeur du viewBox (généralement 512)

    // Calculer la taille et position de l'icône
    const iconSize = size * 0.6; // L'icône occupe 60% de l'espace
    const scale = iconSize / viewBox;
    const offsetX = (size - iconSize) / 2;
    const offsetY = (size - iconSize) / 2;

    // Dessiner l'icône FontAwesome
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = iconColor;

    // Créer un path2D depuis le SVG path
    const path = new Path2D(svgPathData as string);
    ctx.fill(path);

    ctx.restore();

    return canvas.toDataURL("image/png");
  };

  // Générer toutes les previews
  useEffect(() => {
    const newPreviews: { [key: number]: string } = {};
    SIZES.forEach((size) => {
      newPreviews[size] = generateIcon(size);
    });
    setPreviews(newPreviews);
  }, [bgColor, iconColor, selectedIcon, shape]);

  // Télécharger une icône
  const downloadIcon = (size: number) => {
    const dataUrl = previews[size];
    const link = document.createElement("a");
    if (size === 180) {
      link.download = `apple-touch-icon.png`;
    } else {
      link.download = `icon-${size}x${size}.png`;
    }
    link.href = dataUrl;
    link.click();
  };

  // Télécharger toutes les icônes
  const downloadAll = () => {
    SIZES.forEach((size) => {
      setTimeout(() => downloadIcon(size), size * 2);
    });
  };

  // Générer et télécharger le favicon.ico
  const downloadFavicon = () => {
    // Pour le favicon, on utilise la version 32x32
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;

    // Fond
    ctx.fillStyle = bgColor;
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === "rounded") {
      roundRect(ctx, 0, 0, 32, 32, 5);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, 32, 32);
    }

    // Icône FontAwesome
    const faIcon = ICONS[selectedIcon].icon;
    const svgPathData = faIcon.icon[4];
    const viewBox = faIcon.icon[0];

    const iconSize = 32 * 0.6;
    const scale = iconSize / viewBox;
    const offsetX = (32 - iconSize) / 2;
    const offsetY = (32 - iconSize) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = iconColor;

    const path = new Path2D(svgPathData as string);
    ctx.fill(path);

    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "favicon.ico";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 dark:font-mono">
          🎨 Générateur d&apos;icônes - MaestroSalle
        </h1>
        <p className="text-muted-foreground">
          Générez toutes les icônes nécessaires pour votre PWA et votre favicon
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="dark:font-mono">⚙️ Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sélection icône */}
            <div>
              <Label className="mb-3 block dark:font-mono">Icône :</Label>
              <div className="grid grid-cols-2 gap-2">
                {ICONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIcon(idx)}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${
                        selectedIcon === idx
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    <div className="text-xs dark:font-mono">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Forme */}
            <div>
              <Label className="mb-3 block dark:font-mono">Forme :</Label>
              <div className="grid grid-cols-3 gap-2">
                {SHAPES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setShape(s.value)}
                    className={`
                      p-2 rounded-lg border-2 text-sm transition-all dark:font-mono
                      ${
                        shape === s.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Couleur icône */}
            <div>
              <Label className="mb-2 block dark:font-mono">Couleur icône :</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  className="w-16 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border dark:bg-background dark:font-mono text-sm"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setIconColor("#8b5cf6")}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  Violet
                </button>
                <button
                  onClick={() => setIconColor("#ffffff")}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  Blanc
                </button>
                <button
                  onClick={() => setIconColor("#0a0a0a")}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  Noir
                </button>
              </div>
            </div>

            {/* Couleur fond */}
            <div>
              <Label className="mb-2 block dark:font-mono">Couleur fond :</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-16 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border dark:bg-background dark:font-mono text-sm"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setBgColor("#ffffff")}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  Blanc
                </button>
                <button
                  onClick={() => setBgColor("#0a0a0a")}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  Noir
                </button>
                <button
                  onClick={() => setBgColor("#8b5cf6")}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  Violet
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                onClick={downloadAll}
                className="w-full dark:font-mono"
                size="lg"
              >
                📥 Télécharger toutes les icônes
              </Button>
              <Button
                onClick={downloadFavicon}
                variant="outline"
                className="w-full dark:font-mono"
              >
                🌟 Télécharger favicon.ico
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previews */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="dark:font-mono">👁️ Aperçu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {SIZES.map((size) => (
                  <div key={size} className="text-center">
                    <div
                      className="mb-2 mx-auto border rounded-lg overflow-hidden"
                      style={{
                        width: size > 144 ? "96px" : `${size}px`,
                        height: size > 144 ? "96px" : `${size}px`,
                      }}
                    >
                      {previews[size] && (
                        <img
                          src={previews[size]}
                          alt={`Icon ${size}x${size}`}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 dark:font-mono">
                      {size === 180 ? "Apple" : `${size}x${size}`}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadIcon(size)}
                      className="text-xs dark:font-mono"
                    >
                      ⬇️
                    </Button>
                  </div>
                ))}

                {/* Favicon preview */}
                <div className="text-center">
                  <div className="mb-2 mx-auto border rounded-lg overflow-hidden w-8 h-8">
                    <img
                      src={previews[32] || generateIcon(32)}
                      alt="Favicon"
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1 dark:font-mono">
                    Favicon
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadFavicon}
                    className="text-xs dark:font-mono"
                  >
                    ⬇️
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="dark:font-mono">
                📋 Instructions d&apos;installation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm dark:font-mono">
              <div>
                <strong>1. Téléchargez toutes les icônes</strong>
                <p className="text-muted-foreground">
                  Cliquez sur &quot;Télécharger toutes les icônes&quot; ci-dessus
                </p>
              </div>
              <div>
                <strong>2. Créez le dossier</strong>
                <code className="block bg-muted p-2 rounded mt-1">
                  public/icons/
                </code>
              </div>
              <div>
                <strong>3. Placez les fichiers</strong>
                <p className="text-muted-foreground">
                  Déplacez tous les fichiers téléchargés dans{" "}
                  <code>public/icons/</code>
                </p>
              </div>
              <div>
                <strong>4. Remplacez le favicon</strong>
                <p className="text-muted-foreground">
                  Téléchargez le favicon et remplacez{" "}
                  <code>public/favicon.ico</code>
                </p>
              </div>
              <div>
                <strong>5. Rafraîchissez</strong>
                <p className="text-muted-foreground">
                  Rechargez votre app (Cmd+Shift+R) pour voir les changements
                </p>
              </div>
              <div className="pt-2 border-t space-y-2">
                <p className="text-muted-foreground">
                  ✨ <strong>Info :</strong> Les icônes sont générées depuis les pictogrammes FontAwesome pour un rendu professionnel
                </p>
                <p className="text-muted-foreground">
                  💡 <strong>Astuce :</strong> Pour la PWA, consultez le fichier{" "}
                  <code>.claude/PWA.md</code> pour les prochaines étapes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
