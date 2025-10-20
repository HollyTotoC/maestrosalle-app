"use client";

import { FormData } from "@/types/cloture";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faClock,
  faCalendar,
  faMoneyBill,
  faCreditCard,
  faDesktop,
  faPlus,
  faExclamationTriangle,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

interface ResumeCardProps {
  formData: FormData;
  currentStep: number;
  onStepChange?: (step: number) => void;
}

/**
 * Carte de résumé temps réel affichant les données au fur et à mesure
 *
 * États:
 * - ⏳ En attente: donnée pas encore remplie
 * - ✓ Validé: donnée remplie et validée
 * - Cliquable: permet de revenir à l'étape correspondante
 */
export default function ResumeCard({ formData, currentStep, onStepChange }: ResumeCardProps) {
  // Helpers pour formater les données
  const formatDate = (date: FormData["date"]) => {
    if (!date) return null;
    return new Date(date.seconds * 1000).toLocaleDateString("fr-FR");
  };

  const formatTPE = (amounts: number[]) => {
    if (!amounts || amounts.length === 0) return null;
    const total = amounts.reduce((sum, val) => sum + val, 0);
    return `${total}€ (${amounts.length} terminaux)`;
  };

  const formatExtraFlow = (entries: FormData["extraFlowEntries"]) => {
    if (!entries || entries.length === 0) return "Aucun flux";
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    return `${total}€ (${entries.length} entrée${entries.length > 1 ? "s" : ""})`;
  };

  const formatDiscrepancy = (value: number | undefined, type: "cb" | "cash") => {
    if (value === undefined) return null;
    const status = type === "cb"
      ? (Math.abs(value) <= 5 ? "OK" : "⚠️")
      : (Math.abs(value) <= 20 ? "OK" : "⚠️");
    return `${value}€ (${status})`;
  };

  // Composant pour une ligne du résumé
  const ResumeLine = ({
    icon,
    label,
    value,
    isPending = false,
    stepNumber,
  }: {
    icon: import("@fortawesome/fontawesome-svg-core").IconDefinition;
    label: string;
    value: string | null;
    isPending?: boolean;
    stepNumber?: number;
  }) => {
    // L'élément est cliquable si:
    // 1. Il n'est pas en attente (données remplies)
    // 2. L'étape associée est <= à l'étape actuelle (pas de skip forward)
    // 3. On a une fonction de navigation
    // 4. Ce n'est pas l'étape actuelle (pas de clic sur soi-même)
    const isClickable =
      !isPending &&
      stepNumber !== undefined &&
      stepNumber < currentStep &&
      onStepChange !== undefined;

    const handleClick = () => {
      if (isClickable && stepNumber !== undefined) {
        onStepChange?.(stepNumber);
      }
    };

    return (
      <div
        className={`flex items-start gap-3 py-2 border-b border-border/30 last:border-0 ${
          isClickable
            ? "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors rounded-lg px-2 -mx-2"
            : ""
        }`}
        onClick={handleClick}
      >
        <FontAwesomeIcon
          icon={isPending ? faClock : faCheckCircle}
          className={`mt-0.5 ${
            isPending
              ? "text-muted-foreground"
              : "text-success dark:text-green-400"
          }`}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={icon} className="text-primary text-sm" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <div
            className={`text-sm mt-0.5 ${
              isPending ? "text-muted-foreground italic" : "text-foreground font-semibold"
            }`}
          >
            {value || "En attente..."}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none rounded-2xl dark:rounded border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} className="text-primary" />
          Récapitulatif
        </CardTitle>
        <CardDescription>
          Données saisies en temps réel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Date - Step 1 */}
        <ResumeLine
          icon={faCalendar}
          label="Date"
          value={formatDate(formData.date)}
          isPending={!formData.date}
          stepNumber={1}
        />

        {/* Previous Cash - Step 1 */}
        <ResumeLine
          icon={faMoneyBill}
          label="Cash précédent"
          value={formData.previousCash !== undefined ? `${formData.previousCash}€` : null}
          isPending={formData.previousCash === undefined}
          stepNumber={1}
        />

        {/* Cash Counted - Step 1 */}
        <ResumeLine
          icon={faCoins}
          label="Cash compté"
          value={formData.cashCounted !== undefined ? `${formData.cashCounted}€` : null}
          isPending={formData.cashCounted === undefined}
          stepNumber={1}
        />

        {/* TPE - Step 2 */}
        <ResumeLine
          icon={faCreditCard}
          label="Montants TPE"
          value={formatTPE(formData.tpeAmounts)}
          isPending={!formData.tpeAmounts || formData.tpeAmounts.length === 0}
          stepNumber={2}
        />

        {/* Zelty - Step 3 */}
        <ResumeLine
          icon={faDesktop}
          label="Zelty"
          value={
            formData.cbZelty !== undefined && formData.cashZelty !== undefined
              ? `CB: ${formData.cbZelty}€ | Cash: ${formData.cashZelty}€`
              : null
          }
          isPending={
            formData.cbZelty === undefined || formData.cashZelty === undefined
          }
          stepNumber={3}
        />

        {/* Extra Flow - Step 4 */}
        <ResumeLine
          icon={faPlus}
          label="Flux extra"
          value={formatExtraFlow(formData.extraFlowEntries)}
          isPending={currentStep < 5}
          stepNumber={4}
        />

        {/* Écarts - Step 5 */}
        <ResumeLine
          icon={faExclamationTriangle}
          label="Écarts"
          value={
            formData.tpeDiscrepancy !== undefined && formData.cashDiscrepancy !== undefined
              ? `CB: ${formatDiscrepancy(formData.tpeDiscrepancy, "cb")} | Cash: ${formatDiscrepancy(formData.cashDiscrepancy, "cash")}`
              : null
          }
          isPending={
            formData.tpeDiscrepancy === undefined ||
            formData.cashDiscrepancy === undefined
          }
          stepNumber={5}
        />

        {/* Répartition - Step 6 */}
        <ResumeLine
          icon={faCoins}
          label="Répartition"
          value={
            formData.cashToKeep !== undefined && formData.cashToSafe !== undefined
              ? `Caisse: ${formData.cashToKeep}€ | Coffre: ${formData.cashToSafe}€`
              : null
          }
          isPending={
            formData.cashToKeep === undefined || formData.cashToSafe === undefined
          }
          stepNumber={6}
        />
      </CardContent>
    </Card>
  );
}
