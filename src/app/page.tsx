import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 p-24">
      <h1 className="text-3xl">
        Bienvenue sur MaestroSalle !
      </h1>
      <p className="text-lg">
        MaestroSalle est une application de gestion de restaurant pour fluidifier le gestion de la salle.
      </p>
      <div className="mt-4">
        <Button>Login</Button>
      </div>
    </div>
  )
}
