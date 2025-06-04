import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase/client";
import { db } from "@/lib/firebase/firebase";
import { useUserStore } from "@/store/useUserStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Récupère les infos Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser(
            user.uid,
            data.role ?? null,
            data.email ?? user.email ?? null,
            data.restaurantId ?? null,
            data.avatarUrl ?? user.photoURL ?? null,
            data.displayName ?? user.displayName ?? null
          );
        } else {
          setUser(
            user.uid,
            null,
            user.email,
            null,
            user.photoURL,
            user.displayName
          );
        }
      } else {
        setUser(null, null, null, null, null, null);
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}
