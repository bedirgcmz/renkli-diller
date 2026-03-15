import { useEffect, useState } from "react";

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Placeholder: connect to RevenueCat / local store
    setIsPremium(false);
  }, []);

  return { isPremium };
}
