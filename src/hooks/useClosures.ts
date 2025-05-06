import { fetchClosures } from "@/lib/firebase/server";
import { useClosuresStore } from "@/store/useClosuresStore";

export async function updateClosuresIfNeeded(restaurantId: string) {
  const { closures, lastUpdated, setClosures, setLastUpdated } = useClosuresStore.getState();

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (lastUpdated && now - lastUpdated < oneHour) {
    console.log("Les données sont à jour.");
    return closures;
  }

  console.log("Mise à jour des données depuis Firebase...");
  const newClosures = await fetchClosures(restaurantId);

  setClosures(newClosures);
  setLastUpdated(now);

  return newClosures;
}