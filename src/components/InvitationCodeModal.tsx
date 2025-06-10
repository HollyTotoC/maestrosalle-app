import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";


interface InvitationCodeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export function InvitationCodeModal({ open, onClose, onSubmit }: InvitationCodeModalProps) {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrer votre code d&apos;invitation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleValidate} className="flex flex-col gap-4 items-center">
          <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && <div className="text-destructive text-sm mt-1">{error}</div>}
          <DialogFooter className="w-full flex justify-end">
            <Button type="submit" className="w-full" disabled={code.length !== 6}>Valider</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}