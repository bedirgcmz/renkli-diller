import { Platform } from "react-native";

// expo-notifications throws a fatal error on Android Expo Go SDK 53+
// (remote push notifications were removed from Expo Go).
// We lazy-require it so the crash is caught and the app still starts.
// Local notification scheduling works fine in development builds.

type NotificationsModule = typeof import("expo-notifications");

let N: NotificationsModule | null = null;
try {
  N = require("expo-notifications") as NotificationsModule;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Not available in Expo Go on Android SDK 53+
}

const DAILY_REMINDER_ID = "parlio_daily_reminder";

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!N) return false;
  try {
    if (Platform.OS === "android") {
      await N.setNotificationChannelAsync("default", {
        name: "Parlio",
        importance: N.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status: existingStatus } = await N.getPermissionsAsync();
    if (existingStatus === "granted") return true;
    const { status } = await N.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  title: string,
  body: string,
): Promise<boolean> {
  if (!N) return false;
  try {
    await cancelDailyReminder();
    await N.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: { title, body, sound: true },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch {
    // already cancelled or never scheduled
  }
}

export function parseReminderTime(timeStr: string): { hour: number; minute: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { hour: h ?? 19, minute: m ?? 0 };
}
