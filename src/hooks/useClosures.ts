import { fetchClosures } from "@/lib/firebase/server";
import { useClosuresStore } from "@/store/useClosuresStore";

export async function updateClosuresIfNeeded(restaurantId: string) {
  const { closures, lastUpdated, setClosures, setLastUpdated } = useClosuresStore.getState();

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (lastUpdated && now - lastUpdated < oneHour) {
    return closures;
  }

  const newClosures = await fetchClosures(restaurantId);

  setClosures(newClosures);
  setLastUpdated(now);

  return newClosures;
}