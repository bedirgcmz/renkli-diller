import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/store/useSettingsStore";
import { UserProgress } from "@/types";

type Period = "week" | "month";

interface Bar {
  date: string;   // "YYYY-MM-DD"
  count: number;
}

interface Props {
  progress: UserProgress[];
}

const LOCALE_MAP: Record<string, string> = {
  tr: "tr-TR",
  en: "en-US",
  sv: "sv-SE",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
};

const BAR_MAX_HEIGHT = 72;

export default function ActivityChart({ progress }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { uiLanguage } = useSettingsStore();
  const [period, setPeriod] = useState<Period>("week");

  const todayStr = new Date().toISOString().split("T")[0];
  const locale = LOCALE_MAP[uiLanguage] ?? "en-US";

  const { bars, maxCount, totalInPeriod } = useMemo<{
    bars: Bar[];
    maxCount: number;
    totalInPeriod: number;
  }>(() => {
    const days = period === "week" ? 7 : 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayKeys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dayKeys.push(d.toISOString().split("T")[0]);
    }

    const counts: Record<string, number> = {};
    for (const p of progress) {
      if (p.state === "learned" && p.learned_at) {
        const day = p.learned_at.split("T")[0];
        if (counts[day] !== undefined || dayKeys.includes(day)) {
          counts[day] = (counts[day] ?? 0) + 1;
        }
      }
    }

    const bars: Bar[] = dayKeys.map((date) => ({ date, count: counts[date] ?? 0 }));
    const maxCount = Math.max(...bars.map((b) => b.count), 1);
    const totalInPeriod = bars.reduce((s, b) => s + b.count, 0);

    return { bars, maxCount, totalInPeriod };
  }, [progress, period]);

  // Label shown below each bar
  const getLabel = (date: string, idx: number): string => {
    if (period === "week") {
      // "Pzt", "Sal" ... abbreviated weekday
      return new Date(date + "T12:00:00")
        .toLocaleDateString(locale, { weekday: "short" })
        .slice(0, 2);
    }
    // Monthly: show date number for every 7th bar + today
    if (date === todayStr || idx % 7 === 0) {
      return new Date(date + "T12:00:00").getDate().toString();
    }
    return "";
  };

  const isToday = (date: string) => date === todayStr;

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t("profile.activity")}</Text>
        <View style={[styles.toggle, { backgroundColor: colors.backgroundSecondary }]}>
          {(["week", "month"] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.toggleBtn,
                period === p && [styles.toggleBtnActive, { backgroundColor: colors.surface }],
              ]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: period === p ? colors.text : colors.textSecondary },
                ]}
              >
                {t(`profile.${p}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary line */}
      <Text style={[styles.summary, { color: colors.textSecondary }]}>
        {totalInPeriod > 0
          ? `${totalInPeriod} ${t("profile.sentences_in_period")}`
          : t("profile.no_activity")}
      </Text>

      {/* Chart */}
      <View style={[styles.chart, { gap: period === "week" ? 6 : 3 }]}>
        {bars.map((bar, idx) => {
          const today = isToday(bar.date);
          const hasActivity = bar.count > 0;
          const barH = hasActivity
            ? Math.max((bar.count / maxCount) * BAR_MAX_HEIGHT, 5)
            : 0;
          const barColor = today
            ? colors.primary
            : hasActivity
              ? colors.primary + "66"
              : "transparent";
          const label = getLabel(bar.date, idx);

          return (
            <View key={bar.date} style={styles.barCol}>
              {/* Count label — only show if bar has activity */}
              <Text style={[styles.countText, { color: colors.textTertiary }]}>
                {hasActivity ? bar.count : ""}
              </Text>

              {/* Bar track */}
              <View style={[styles.barTrack, { height: BAR_MAX_HEIGHT }]}>
                {/* Empty slot line */}
                {!hasActivity && (
                  <View
                    style={[
                      styles.emptySlot,
                      {
                        backgroundColor: colors.border,
                        borderRadius: period === "week" ? 4 : 2,
                      },
                    ]}
                  />
                )}
                {hasActivity && (
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barH,
                        backgroundColor: barColor,
                        borderRadius: period === "week" ? 6 : 3,
                        shadowColor: today ? colors.primary : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: today ? 0.35 : 0,
                        shadowRadius: 4,
                        elevation: today ? 3 : 0,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Day label */}
              <Text
                style={[
                  styles.dayLabel,
                  { color: today ? colors.primary : colors.textTertiary },
                  today && styles.dayLabelToday,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: { fontSize: 15, fontWeight: "700" },
  toggle: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: { fontSize: 12, fontWeight: "600" },
  summary: { fontSize: 12, marginBottom: 14 },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  countText: {
    fontSize: 8,
    fontWeight: "600",
    height: 11,
    lineHeight: 11,
  },
  barTrack: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  emptySlot: {
    width: "60%",
    height: 3,
  },
  bar: {
    width: "100%",
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: "500",
    height: 12,
    lineHeight: 12,
  },
  dayLabelToday: {
    fontWeight: "800",
  },
});
