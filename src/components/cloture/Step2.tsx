import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Step2({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Étape 2 : Informations TPE</h2>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="tpe1">Montant TPE 1</Label>
          <Input id="tpe1" type="number" placeholder="Ex: 500" />
        </div>
        <div>
          <Label htmlFor="tpe2">Montant TPE 2</Label>
          <Input id="tpe2" type="number" placeholder="Ex: 300" />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={prevStep}>
          Précédent
        </Button>
        <Button onClick={nextStep}>Suivant</Button>
      </div>
    </div>
  );
}