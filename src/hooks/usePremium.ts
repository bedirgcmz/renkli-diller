import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { isPremiumActive } from "@/services/revenueCat";

export function usePremium() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  // useAuthStore'daki is_premium'u temel kaynak olarak kullan,
  // ek olarak RevenueCat'ten anlık durum kontrolü yap.
  const [isPremium, setIsPremium] = useState(user?.is_premium ?? false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const active = await isPremiumActive();
      // Supabase'deki manuel değer veya RevenueCat — ikisi de yeterli
      const effective = active || (user?.is_premium ?? false);
      setIsPremium(effective);

      // Supabase'e sadece RevenueCat premium onayladığında yaz (false ile ezme)
      if (user && active && !user.is_premium) {
        await updateProfile({ is_premium: true });
      }
    } catch {
      // RevenueCat erişilemezse mevcut store değerini kullan
      setIsPremium(user?.is_premium ?? false);
    } finally {
      setLoading(false);
    }
  }, [user, updateProfile]);

  useEffect(() => {
    if (user) {
      refresh().catch((e) => console.error("[usePremium] refresh error:", e));
    } else {
      setIsPremium(false);
    }
  }, [user?.id]); // user değişince yeniden kontrol et

  return { isPremium, loading, refresh };
}
