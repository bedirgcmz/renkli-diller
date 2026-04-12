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
const DEFAULT_REMINDER_TITLE = "Parlio";
const DEFAULT_REMINDER_BODY = "Time for your daily language practice.";

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
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return { hour: Number.isNaN(h) ? 19 : h, minute: Number.isNaN(m) ? 0 : m };
}

export async function syncDailyReminderSchedule(params: {
  enabled: boolean;
  reminderTime: string;
  title?: string;
  body?: string;
  requestPermissions?: boolean;
}): Promise<boolean> {
  if (!params.enabled) {
    await cancelDailyReminder();
    return true;
  }

  let granted = false;
  if (params.requestPermissions) {
    granted = await requestNotificationPermissions();
  } else if (N) {
    try {
      const perms = await N.getPermissionsAsync();
      granted = perms.status === "granted";
    } catch {
      granted = false;
    }
  }
  if (!granted) return false;

  const { hour, minute } = parseReminderTime(params.reminderTime);
  return scheduleDailyReminder(
    hour,
    minute,
    params.title ?? DEFAULT_REMINDER_TITLE,
    params.body ?? DEFAULT_REMINDER_BODY,
  );
}
