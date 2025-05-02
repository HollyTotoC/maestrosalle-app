import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Step3({ prevStep }: { prevStep: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Étape 3 : Informations Zelty</h2>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="zelty">Montant déclaré sur Zelty</Label>
          <Input id="zelty" type="number" placeholder="Ex: 800" />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={prevStep}>
          Précédent
        </Button>
        <Button>Terminer</Button>
      </div>
    </div>
  );
}