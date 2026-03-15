import Purchases from 'react-native-purchases';

export function initRevenueCat(apiKey: string) {
  Purchases.setDebugLogsEnabled(true);
  Purchases.setup(apiKey);
}
