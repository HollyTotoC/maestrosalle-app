import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Step1({ nextStep }: { nextStep: () => void }) {
  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Étape 1 : Informations générales</CardTitle>
          <CardDescription>
            Renseignez les informations de la journée à clôturer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="date">Date de la journée</Label>
              <Input id="date" type="date" />
            </div>
            <div>
              <Label htmlFor="servers">Nombre de serveurs</Label>
              <Input id="servers" type="number" placeholder="Ex: 3" />
            </div>
            <div>
              <Label htmlFor="tips">Montant des pourboires</Label>
              <Input id="tips" type="number" placeholder="Ex: 50" />
            </div>
            <div>
              <Label htmlFor="cash">Montant en caisse (cash)</Label>
              <Input id="cash" type="number" placeholder="Ex: 200" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={nextStep}>Suivant</Button>
        </CardFooter>
      </Card>
    </div>
  );
}