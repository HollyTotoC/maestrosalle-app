"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

/**
 * Client-only Toaster component to avoid hydration mismatch.
 * Only renders after client-side mount.
 */
export default function ClientToaster() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Toaster />;
}
