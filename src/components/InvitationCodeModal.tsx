import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";


interface InvitationCodeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  isLoading?: boolean;
}

export function InvitationCodeModal({ open, onClose, onSubmit, isLoading = false }: InvitationCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Le code doit comporter 6 chiffres.");
      return;
    }
    setError("");
    onSubmit(code);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          bg-card/60 backdrop-blur-xl backdrop-saturate-150
          dark:bg-card dark:backdrop-blur-none
          rounded-2xl dark:rounded-sm
          border border-border/50 dark:border-2
          shadow-lg dark:shadow-sm
          transition-all duration-200 dark:duration-300
        "
      >
        <DialogHeader>
          <DialogTitle className="dark:font-mono">Entrer votre code d&apos;invitation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleValidate} className="flex flex-col gap-4 items-center">
          <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus disabled={isLoading}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && (
            <div
              className="
                w-full p-3
                bg-destructive/10 border border-destructive/50
                dark:bg-red-500/10 dark:border-red-400/50
                rounded-lg dark:rounded-sm
                text-destructive dark:text-red-400
                text-sm dark:font-mono
                transition-all duration-200 dark:duration-300
              "
            >
              ⚠️ {error}
            </div>
          )}
          <DialogFooter className="w-full flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="
                flex-1
                rounded-lg dark:rounded-sm
                dark:font-mono
                transition-all duration-200 dark:duration-300
              "
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="
                flex-1
                rounded-lg dark:rounded-sm
                dark:font-mono
                transition-all duration-200 dark:duration-300
              "
              disabled={code.length !== 6 || isLoading}
            >
              {isLoading && <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />}
              {isLoading ? "Validation..." : "Valider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}