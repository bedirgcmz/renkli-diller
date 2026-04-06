import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useLeaderboardStore, LeaderboardEntry } from "@/store/useLeaderboardStore";

type Tab = "learned" | "studied";

const FREE_VISIBLE = 2;
const PREMIUM_VISIBLE = 20;
const MEDALS = ["🥇", "🥈", "🥉"];

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

function AvatarCell({
  entry,
  size = 36,
  primaryColor,
}: {
  entry: LeaderboardEntry;
  size?: number;
  primaryColor: string;
}) {
  const [error, setError] = useState(false);

  if (entry.avatar_url && !error) {
    return (
      <Image
        source={{ uri: entry.avatar_url }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.avatarFallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: primaryColor },
      ]}
    >
      <Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>
        {getInitials(entry.display_name)}
      </Text>
    </View>
  );
}

function EntryRow({
  entry,
  rank,
  isMe,
  count,
  colors,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  count: number;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const { t } = useTranslation();
  const medal = rank <= 3 ? MEDALS[rank - 1] : null;

  return (
    <View
      style={[
        styles.row,
        isMe && { backgroundColor: colors.primary + "14", borderRadius: 10 },
      ]}
    >
      {/* Rank */}
      <View style={styles.rankCell}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.rankText, { color: colors.textSecondary }]}>
            {t("leaderboard.rank_label", { rank })}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <AvatarCell entry={entry} primaryColor={colors.primary} />

      {/* Name */}
      <View style={styles.nameCell}>
        <Text
          style={[styles.nameText, { color: colors.text }]}
          numberOfLines={1}
        >
          {entry.display_name}
        </Text>
        {isMe && (
          <Text style={[styles.youBadge, { color: colors.primary }]}>
            {t("leaderboard.you")}
          </Text>
        )}
      </View>

      {/* Count */}
      <Text style={[styles.countText, { color: colors.text }]}>{count}</Text>
    </View>
  );
}

function BlurredRows({
  count,
  colors,
  onUpgrade,
}: {
  count: number;
  colors: ReturnType<typeof useTheme>["colors"];
  onUpgrade: () => void;
}) {
  const { t } = useTranslation();
  if (count <= 0) return null;

  return (
    <View style={styles.blurWrapper}>
      {/* Ghost rows */}
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <View key={i} style={[styles.row, styles.ghostRow]}>
          <View style={[styles.rankCell]}>
            <View style={[styles.ghostPill, { backgroundColor: colors.border, width: 24 }]} />
          </View>
          <View style={[styles.avatar, styles.ghostCircle, { backgroundColor: colors.border }]} />
          <View style={styles.nameCell}>
            <View
              style={[
                styles.ghostPill,
                { backgroundColor: colors.border, width: 80 + (i % 3) * 20 },
              ]}
            />
          </View>
          <View style={[styles.ghostPill, { backgroundColor: colors.border, width: 30 }]} />
        </View>
      ))}

      {/* Overlay */}
      <View style={[styles.blurOverlay, { backgroundColor: colors.background + "CC" }]}>
        <Ionicons name="lock-closed" size={22} color={colors.textSecondary} />
        <Text style={[styles.blurTitle, { color: colors.text }]}>
          {t("leaderboard.premium_blur_title")}
        </Text>
        <Text style={[styles.blurDesc, { color: colors.textSecondary }]}>
          {t("leaderboard.premium_blur_desc")}
        </Text>
        <TouchableOpacity
          style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
          onPress={onUpgrade}
          activeOpacity={0.85}
        >
          <Text style={styles.upgradeBtnText}>{t("leaderboard.unlock_premium")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function LeaderboardModal({ visible, onClose, onUpgrade }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const isPremium = user?.is_premium ?? false;
  const { entries, myEntry, loading, loadLeaderboard } = useLeaderboardStore();

  const [activeTab, setActiveTab] = useState<Tab>("learned");

  useEffect(() => {
    if (visible) loadLeaderboard();
  }, [visible, loadLeaderboard]);

  // Sort entries by active tab
  const sorted = useCallback(() => {
    return [...entries].sort((a, b) =>
      activeTab === "learned"
        ? b.weekly_learned - a.weekly_learned || b.weekly_studied - a.weekly_studied
        : b.weekly_studied - a.weekly_studied || b.weekly_learned - a.weekly_learned
    );
  }, [entries, activeTab]);

  const visibleLimit = isPremium ? PREMIUM_VISIBLE : FREE_VISIBLE;
  const sortedEntries = sorted();
  const visibleEntries = sortedEntries.slice(0, visibleLimit);
  const hiddenCount = sortedEntries.length - visibleLimit;

  const myRank =
    myEntry != null
      ? activeTab === "learned"
        ? myEntry.learned_rank
        : myEntry.studied_rank
      : null;

  const myVisibleInList = myEntry
    ? visibleEntries.some((e) => e.user_id === myEntry.user_id)
    : false;

  const handleUpgrade = () => {
    onClose();
    onUpgrade?.();
  };

  // Days until next Monday
  const daysUntilReset = (() => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon...
    return day === 1 ? 7 : (8 - day) % 7;
  })();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.cardBackground }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("leaderboard.title")}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Week reset note */}
          <Text style={[styles.weekNote, { color: colors.textTertiary }]}>
            <Ionicons name="refresh-outline" size={11} color={colors.textTertiary} />{" "}
            {t("leaderboard.week_resets")} ({daysUntilReset}{" "}
            {t("leaderboard.day_unit", { count: daysUntilReset })})
          </Text>

          {/* Tabs */}
          <View style={[styles.tabs, { backgroundColor: colors.background }]}>
            {(["learned", "studied"] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && {
                    backgroundColor: colors.cardBackground,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                  },
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? colors.text : colors.textSecondary },
                  ]}
                >
                  {tab === "learned"
                    ? t("leaderboard.tab_learned")
                    : t("leaderboard.tab_studied")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("leaderboard.empty_title")}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {t("leaderboard.empty_desc")}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            >
              {/* Column header */}
              <View style={styles.colHeader}>
                <Text style={[styles.colHeaderText, { color: colors.textTertiary }]}>
                  {activeTab === "learned"
                    ? t("leaderboard.tab_learned")
                    : t("leaderboard.tab_studied")}
                </Text>
              </View>

              {/* Visible rows */}
              {visibleEntries.map((entry, idx) => {
                const rank = idx + 1;
                const isMe = entry.user_id === user?.id;
                const count =
                  activeTab === "learned" ? entry.weekly_learned : entry.weekly_studied;
                return (
                  <EntryRow
                    key={entry.user_id}
                    entry={entry}
                    rank={rank}
                    isMe={isMe}
                    count={count}
                    colors={colors}
                  />
                );
              })}

              {/* Blurred hidden rows (free users) */}
              {!isPremium && hiddenCount > 0 && (
                <BlurredRows
                  count={hiddenCount}
                  colors={colors}
                  onUpgrade={handleUpgrade}
                />
              )}

              {/* Premium: show "..." if > 20 */}
              {isPremium && hiddenCount > 0 && (
                <Text style={[styles.moreText, { color: colors.textTertiary }]}>
                  {t("leaderboard.more_entries", { count: hiddenCount })}
                </Text>
              )}
            </ScrollView>
          )}

          {/* Pinned: user's rank if not in visible list */}
          {!loading && myEntry && !myVisibleInList && (
            <View
              style={[
                styles.myRankBar,
                {
                  backgroundColor: colors.primary + "18",
                  borderTopColor: colors.border,
                },
              ]}
            >
              <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.myRankText, { color: colors.primary }]}>
                {myRank != null
                  ? t("leaderboard.your_rank", { rank: myRank })
                  : t("leaderboard.not_ranked")}
              </Text>
            </View>
          )}

          {/* Not ranked at all */}
          {!loading && !myEntry && entries.length > 0 && (
            <View
              style={[
                styles.myRankBar,
                { backgroundColor: colors.border + "40", borderTopColor: colors.border },
              ]}
            >
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.myRankText, { color: colors.textSecondary }]}>
                {t("leaderboard.not_ranked")}
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "700" },
  weekNote: {
    fontSize: 11,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
  colHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 4,
    marginBottom: 6,
  },
  colHeaderText: { fontSize: 11, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  rankCell: { width: 30, alignItems: "center" },
  medal: { fontSize: 20 },
  rankText: { fontSize: 13, fontWeight: "700" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#fff", fontWeight: "700" },
  nameCell: { flex: 1 },
  nameText: { fontSize: 14, fontWeight: "600" },
  youBadge: { fontSize: 11, fontWeight: "700", marginTop: 1 },
  countText: { fontSize: 15, fontWeight: "700", minWidth: 28, textAlign: "right" },
  // Blurred rows
  blurWrapper: { position: "relative" },
  ghostRow: { opacity: 0.5 },
  ghostCircle: { borderRadius: 18 },
  ghostPill: { height: 10, borderRadius: 5 },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  blurTitle: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  blurDesc: { fontSize: 12, textAlign: "center" },
  upgradeBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },
  upgradeBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  // Pinned rank bar
  myRankBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  myRankText: { fontSize: 14, fontWeight: "700" },
  moreText: { textAlign: "center", fontSize: 12, paddingTop: 8 },
});
