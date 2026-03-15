import Purchases from "react-native-purchases";

export function initRevenueCat(apiKey: string) {
  Purchases.setDebugLogsEnabled(true);
  Purchases.configure({ apiKey });
}
