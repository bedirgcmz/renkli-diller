import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Expo Go'da RevenueCat native store yoktur
const isExpoGo = Constants.executionEnvironment === "storeClient";

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "",
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "",
};

// RevenueCat'te tanımladığın entitlement adı
export const ENTITLEMENT_PREMIUM = "premium";

// Offering içindeki package identifier'lar (RevenueCat dashboard'da tanımlanır)
export const PACKAGE_IDS = {
  monthly: "$rc_monthly",
  annual: "$rc_annual",
} as const;

export type PackageType = keyof typeof PACKAGE_IDS;

export async function initRevenueCat(userId?: string): Promise<void> {
  if (isExpoGo) return;
  if (await Purchases.isConfigured()) return;

  const apiKey = Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android;

  if (__DEV__) {
    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({ apiKey });

  if (userId) {
    await Purchases.logIn(userId);
  }
}

export async function logInUser(userId: string): Promise<void> {
  if (isExpoGo) return;
  if (!(await Purchases.isConfigured())) return;
  await Purchases.logIn(userId);
}

export async function logOutUser(): Promise<void> {
  if (isExpoGo) return;
  if (!(await Purchases.isConfigured())) return;
  await Purchases.logOut();
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (isExpoGo) return null;
  if (!(await Purchases.isConfigured())) return null;
  return Purchases.getCustomerInfo();
}

export type PremiumCheckResult = { active: boolean; verified: boolean };

/**
 * Returns { active, verified }.
 * verified=false means RC was unavailable (Expo Go, not configured, or threw) —
 * callers should fall back to the Supabase value in that case.
 * verified=true means RC answered authoritatively (active may be true or false).
 */
export async function isPremiumActive(): Promise<PremiumCheckResult> {
  if (isExpoGo) return { active: false, verified: false };
  const info = await getCustomerInfo();
  if (!info) return { active: false, verified: false };
  const active = info.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined;
  return { active, verified: true };
}

/**
 * Subscribes to real-time CustomerInfo updates from RevenueCat.
 * Returns a cleanup function — call it on sign-out or store teardown.
 */
export function setupCustomerInfoListener(
  cb: (active: boolean) => void
): () => void {
  if (isExpoGo) return () => {};
  const listener = (info: CustomerInfo) => {
    const active = info.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined;
    cb(active);
  };
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (isExpoGo) return null;
  if (!(await Purchases.isConfigured())) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

// RevenueCat errors are plain objects with optional typed fields.
function asRCError(e: unknown): { userCancelled?: boolean; message?: string } {
  if (typeof e === "object" && e !== null)
    return e as { userCancelled?: boolean; message?: string };
  return {};
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
  userCancelled?: boolean;
}> {
  if (isExpoGo) return { success: false, error: "Not available in Expo Go" };
  if (!(await Purchases.isConfigured()))
    return { success: false, error: "RevenueCat not configured" };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const premium = customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined;
    return { success: premium, customerInfo };
  } catch (e: unknown) {
    const err = asRCError(e);
    if (err.userCancelled) {
      return { success: false, userCancelled: true };
    }
    return { success: false, error: err.message ?? "Purchase failed" };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  if (isExpoGo) return { success: false, isPremium: false, error: "Not available in Expo Go" };
  if (!(await Purchases.isConfigured()))
    return { success: false, isPremium: false, error: "RevenueCat not configured" };
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined;
    return { success: true, isPremium };
  } catch (e: unknown) {
    const err = asRCError(e);
    return { success: false, isPremium: false, error: err.message ?? "Restore failed" };
  }
}
