import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useGameStore } from "@/store/useGameStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAudioSettingsStore } from "@/store/useAudioSettingsStore";
import { BGMusicPickerModal } from "@/components/BGMusicPickerModal";
import {
  GameFilter,
  GameLeaderboardEntry,
  LEAGUE_THRESHOLDS,
  LeagueType,
} from "@/types/game";
import { HomeStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const FILTER_KEYS: { key: GameFilter; i18nKey: string }[] = [
  { key: "global",        i18nKey: "games.hub.filter_global" },
  { key: "user_learning", i18nKey: "games.hub.filter_learning" },
  { key: "user_learned",  i18nKey: "games.hub.filter_learned" },
  { key: "mixed",         i18nKey: "games.hub.filter_mixed" },
];

const LEAGUE_ICONS: Record<LeagueType, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold:   "🥇",
};

const LEAGUE_COLORS: Record<LeagueType, string> = {
  bronze: "#CD7F32",
  silver: "#A8A9AD",
  gold:   "#F59E0B",
};

export default function GameHubScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const { user } = useAuthStore();
  const { targetLanguage, uiLanguage } = useSettingsStore();
  const {
    userStats,
    leaderboard,
    leaderboardLoading,
    loadUserStats,
    loadLeaderboard,
    checkInactivityDemotion,
    retryPendingScore,
  } = useGameStore();

  const [selectedFilter, setSelectedFilter] = useState<GameFilter>("global");
  const [leaderboardModalVisible, setLeaderboardModalVisible] = useState(false);
  const [demotionWarning, setDemotionWarning] = useState<{
    days: number; league: string;
  } | null>(null);

  const {
    bgMusicEnabled,
    sfxEnabled,
    gameBgTrack,
    setBgMusicEnabled,
    setSfxEnabled,
    setGameBgTrack,
    load: loadAudioSettings,
  } = useAudioSettingsStore();

  const [musicPickerGameId, setMusicPickerGameId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadUserStats();
    loadLeaderboard("speed_round", "weekly");
    checkInactivityDemotion();
    void retryPendingScore();
  }, [user]);

  useEffect(() => {
    loadAudioSettings();
  }, []);

  // Inactivity warning (not yet demoted but close)
  useEffect(() => {
    if (!userStats?.lastPlayedAt || userStats.league === "bronze") return;
    const days = Math.floor(
      (Date.now() - new Date(userStats.lastPlayedAt).getTime()) / 86400000
    );
    if (days >= 3) {
      setDemotionWarning({ days, league: userStats.league });
    }
  }, [userStats]);

  const league = userStats?.league ?? "bronze";
  const cumulative = userStats?.cumulativeScore ?? 0;
  const threshold = LEAGUE_THRESHOLDS[league];
  const nextLeague = threshold.next;
  const nextThreshold = nextLeague ? LEAGUE_THRESHOLDS[nextLeague].min : null;
  const progressPct = nextThreshold
    ? Math.min((cumulative / nextThreshold) * 100, 100)
    : 100;

  const speedRoundLeaderboard = leaderboard.speed_round.weekly;
  const weeklyLeaderboardLoading = leaderboardLoading.speed_round.weekly;
  const alltimeLeaderboardLoading = leaderboardLoading.speed_round.alltime;
  const topEntries = speedRoundLeaderboard?.entries.slice(0, 3) ?? [];
  const myRank = speedRoundLeaderboard?.myRank ?? null;

  const openLeaderboardModal = () => {
    setLeaderboardModalVisible(true);
    void loadLeaderboard("speed_round", "weekly");
    void loadLeaderboard("speed_round", "alltime");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }, isSmallScreen && { fontSize: 18 }]}>
          {t("games.hub.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* League Card */}
        <View style={[styles.leagueCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.leagueRow}>
            <Text style={styles.leagueIcon}>{LEAGUE_ICONS[league]}</Text>
            <View style={styles.leagueInfo}>
              <Text style={[styles.leagueName, { color: LEAGUE_COLORS[league] }]}>
                {t(`games.league.${league}`)}
              </Text>
              <Text style={[styles.leagueScore, { color: colors.textSecondary }]}>
                {cumulative.toLocaleString()} {t("games.hub.points_label")}
              </Text>
            </View>
            {myRank && (
              <View style={[styles.rankBadge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.rankText, { color: colors.primary }]}>
                  {t("games.hub.my_rank", { rank: myRank })}
                </Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          {nextLeague && nextThreshold ? (
            <>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPct}%` as any,
                      backgroundColor: LEAGUE_COLORS[nextLeague],
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {t("games.hub.league_progress", {
                  next: t(`games.league.${nextLeague}`),
                  pts: (nextThreshold - cumulative).toLocaleString(),
                })}
              </Text>
            </>
          ) : (
            <Text style={[styles.progressLabel, { color: colors.success }]}>
              {t("games.hub.league_max")}
            </Text>
          )}

          {/* Inactivity warning */}
          {demotionWarning && (
            <View style={[styles.warningBanner, { backgroundColor: colors.warning + "20" }]}>
              <Ionicons name="warning-outline" size={14} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                {t("games.hub.inactivity_warning", {
                  days: demotionWarning.days,
                  league: t(`games.league.${demotionWarning.league}`),
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Filter Selector */}
        <View style={styles.sectionLabel}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("games.hub.filter_label")}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_KEYS.map(({ key, i18nKey }) => {
            const active = selectedFilter === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedFilter(key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.cardBackground,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? "#fff" : colors.text },
                  ]}
                >
                  {t(i18nKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Game Cards */}
        <GameCard
          icon="flash"
          iconColor="#F59E0B"
          name={t("games.speed_round.name")}
          desc={t("games.speed_round.desc")}
          pattern={t("games.speed_round.pattern")}
          bestScore={userStats?.bestSpeedRound ?? 0}
          colors={colors}
          isSmallScreen={isSmallScreen}
          bgMusicEnabled={bgMusicEnabled}
          sfxEnabled={sfxEnabled}
          onToggleBgMusic={() => setBgMusicEnabled(!bgMusicEnabled)}
          onToggleSfx={() => setSfxEnabled(!sfxEnabled)}
          onPickMusic={() => setMusicPickerGameId("speed_round")}
          onPlay={() => navigation.navigate("SpeedRound", { filter: selectedFilter })}
          onHowToPlay={() => navigation.navigate("SpeedRound", { filter: selectedFilter, forceTutorial: true })}
        />

        <GameCard
          icon="rainy"
          iconColor="#4DA3FF"
          name={t("games.word_rain.name")}
          desc={t("games.word_rain.desc")}
          pattern={t("games.word_rain.pattern")}
          bestScore={userStats?.bestWordRain ?? 0}
          colors={colors}
          isSmallScreen={isSmallScreen}
          bgMusicEnabled={bgMusicEnabled}
          sfxEnabled={sfxEnabled}
          onToggleBgMusic={() => setBgMusicEnabled(!bgMusicEnabled)}
          onToggleSfx={() => setSfxEnabled(!sfxEnabled)}
          onPickMusic={() => setMusicPickerGameId("word_rain")}
          onPlay={() => navigation.navigate("WordRain", { filter: selectedFilter })}
          onHowToPlay={() => navigation.navigate("WordRain", { filter: selectedFilter, forceTutorial: true })}
          comingSoon={false}
        />

        {/* Leaderboard Preview */}
        <View style={styles.sectionLabel}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("games.hub.leaderboard_title")} — {t("games.speed_round.name")}
          </Text>
        </View>

        <View style={[styles.leaderboardCard, { backgroundColor: colors.cardBackground }]}>
          {weeklyLeaderboardLoading ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 16 }} />
          ) : topEntries.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("games.hub.leaderboard_empty")}
            </Text>
          ) : (
            topEntries.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                colors={colors}
                isMe={entry.userId === user?.id}
              />
            ))
          )}

          <TouchableOpacity
            style={[styles.seeAllBtn, { borderTopColor: colors.border }]}
            onPress={openLeaderboardModal}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              {t("games.hub.see_all")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <BGMusicPickerModal
        visible={musicPickerGameId !== null}
        initialTrackId={gameBgTrack[musicPickerGameId ?? "speed_round"] ?? "bg1"}
        onConfirm={(trackId) => {
          if (musicPickerGameId) setGameBgTrack(musicPickerGameId, trackId);
          setMusicPickerGameId(null);
        }}
        onCancel={() => setMusicPickerGameId(null)}
      />

      <FullLeaderboardModal
        visible={leaderboardModalVisible}
        onClose={() => setLeaderboardModalVisible(false)}
        weeklyLoading={weeklyLeaderboardLoading}
        alltimeLoading={alltimeLeaderboardLoading}
        weekly={leaderboard.speed_round.weekly}
        alltime={leaderboard.speed_round.alltime}
        currentUserId={user?.id ?? null}
      />
    </SafeAreaView>
  );
}

// ---- GameCard component ----
function GameCard({
  icon,
  iconColor,
  name,
  desc,
  pattern,
  bestScore,
  colors,
  isSmallScreen,
  bgMusicEnabled,
  sfxEnabled,
  onToggleBgMusic,
  onToggleSfx,
  onPickMusic,
  onPlay,
  onHowToPlay,
  comingSoon = false,
}: {
  icon: string;
  iconColor: string;
  name: string;
  desc: string;
  pattern: string;
  bestScore: number;
  colors: any;
  isSmallScreen: boolean;
  bgMusicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleBgMusic: () => void;
  onToggleSfx: () => void;
  onPickMusic: () => void;
  onPlay: () => void;
  onHowToPlay: () => void;
  comingSoon?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View style={[styles.gameCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.gameCardTop}>
        <View style={[styles.gameIconBg, { backgroundColor: iconColor + "20" }]}>
          <Ionicons name={icon as any} size={28} color={iconColor} />
        </View>
        <View style={styles.gameCardInfo}>
          <Text style={[styles.gameName, { color: colors.text }, isSmallScreen && { fontSize: 15 }]}>
            {name}
          </Text>
          <Text style={[styles.gamePattern, { color: colors.textSecondary }]}>
            {pattern}
          </Text>
        </View>
      </View>

      <Text style={[styles.gameDesc, { color: colors.textSecondary }]}>{desc}</Text>

      {bestScore > 0 && (
        <View style={[styles.bestScoreRow, { borderTopColor: colors.border }]}>
          <Ionicons name="trophy-outline" size={13} color={colors.warning} />
          <Text style={[styles.bestScoreText, { color: colors.textSecondary }]}>
            {t("games.common.personal_best")}: {bestScore.toLocaleString()}
          </Text>
        </View>
      )}

      {/* Audio controls row */}
      <View style={[styles.audioRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.audioToggle} onPress={onToggleBgMusic}>
          <Ionicons
            name={bgMusicEnabled ? "musical-notes" : "musical-notes-outline"}
            size={18}
            color={bgMusicEnabled ? iconColor : colors.textTertiary}
          />
          <Text style={[styles.audioToggleText, { color: bgMusicEnabled ? colors.text : colors.textTertiary }]}>
            {t("games.audio.bg_music")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.audioToggle} onPress={onToggleSfx}>
          <Ionicons
            name={sfxEnabled ? "volume-high" : "volume-mute"}
            size={18}
            color={sfxEnabled ? iconColor : colors.textTertiary}
          />
          <Text style={[styles.audioToggleText, { color: sfxEnabled ? colors.text : colors.textTertiary }]}>
            {t("games.audio.sfx")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.audioToggle} onPress={onPickMusic}>
          <Ionicons name="list-outline" size={16} color={colors.primary} />
          <Text style={[styles.audioToggleText, { color: colors.primary }]}>
            {t("games.audio.pick_music")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameCardActions}>
        <TouchableOpacity
          onPress={onHowToPlay}
          style={[styles.howToBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="help-circle-outline" size={15} color={colors.textSecondary} />
          <Text style={[styles.howToText, { color: colors.textSecondary }]}>
            {t("games.common.how_to_play")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlay}
          disabled={comingSoon}
          style={[
            styles.playBtn,
            { backgroundColor: comingSoon ? colors.border : iconColor },
          ]}
        >
          <Ionicons name="play" size={14} color="#fff" />
          <Text style={styles.playBtnText}>
            {comingSoon ? "Yakında" : t("games.common.play")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---- LeaderboardRow component ----
function LeaderboardRow({
  entry,
  colors,
  isMe,
}: {
  entry: GameLeaderboardEntry;
  colors: any;
  isMe: boolean;
}) {
  const rankEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`;

  return (
    <View
      style={[
        styles.leaderboardRow,
        isMe && { backgroundColor: colors.primary + "10" },
      ]}
    >
      <Text style={[styles.leaderboardRank, { color: colors.text }]}>{rankEmoji}</Text>
      <Text
        style={[styles.leaderboardName, { color: colors.text }]}
        numberOfLines={1}
      >
        {entry.displayName}{isMe ? " (Sen)" : ""}
      </Text>
      <Text style={[styles.leaderboardScore, { color: colors.primary }]}>
        {entry.score.toLocaleString()}
      </Text>
    </View>
  );
}

function FullLeaderboardModal({
  visible,
  onClose,
  weeklyLoading,
  alltimeLoading,
  weekly,
  alltime,
  currentUserId,
}: {
  visible: boolean;
  onClose: () => void;
  weeklyLoading: boolean;
  alltimeLoading: boolean;
  weekly: { myRank: number | null; entries: GameLeaderboardEntry[] } | null;
  alltime: { myRank: number | null; entries: GameLeaderboardEntry[] } | null;
  currentUserId: string | null;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [period, setPeriod] = useState<"weekly" | "alltime">("weekly");

  useEffect(() => {
    if (visible) {
      setPeriod("weekly");
    }
  }, [visible]);

  const leaderboard = period === "weekly" ? weekly : alltime;
  const isLoading = period === "weekly" ? weeklyLoading : alltimeLoading;
  const entries = leaderboard?.entries ?? [];
  const myRank = leaderboard?.myRank ?? null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("games.hub.see_all")}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {myRank
                  ? t("games.hub.my_rank", { rank: myRank })
                  : t("games.hub.no_rank")}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.periodTabs, { backgroundColor: colors.backgroundSecondary }]}>
            {([
              { key: "weekly", label: t("games.hub.leaderboard_title") },
              { key: "alltime", label: t("games.hub.leaderboard_alltime") },
            ] as const).map((tab) => {
              const active = period === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.periodTab,
                    active && [styles.periodTabActive, { backgroundColor: colors.surface }],
                  ]}
                  onPress={() => setPeriod(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.periodTabText,
                      { color: active ? colors.text : colors.textSecondary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            style={styles.modalList}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading && entries.length === 0 ? (
              <ActivityIndicator color={colors.primary} style={{ paddingVertical: 32 }} />
            ) : entries.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t("games.hub.leaderboard_empty")}
              </Text>
            ) : (
              entries.map((entry) => (
                <LeaderboardRow
                  key={`${period}_${entry.userId}`}
                  entry={entry}
                  colors={colors}
                  isMe={entry.userId === currentUserId}
                />
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.modalCloseBtn, { borderColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.modalCloseBtnText, { color: colors.text }]}>
              {t("common.close")}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  header:           { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:          { width: 40, alignItems: "flex-start" },
  headerTitle:      { fontSize: 20, fontWeight: "700" },
  scrollContent:    { paddingHorizontal: 16, paddingTop: 8 },

  leagueCard:       { borderRadius: 16, padding: 16, marginBottom: 16 },
  leagueRow:        { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  leagueIcon:       { fontSize: 32, marginRight: 12 },
  leagueInfo:       { flex: 1 },
  leagueName:       { fontSize: 17, fontWeight: "700" },
  leagueScore:      { fontSize: 13, marginTop: 2 },
  rankBadge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rankText:         { fontSize: 12, fontWeight: "600" },
  progressTrack:    { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  progressFill:     { height: "100%", borderRadius: 3 },
  progressLabel:    { fontSize: 12 },
  warningBanner:    { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, padding: 8, borderRadius: 8 },
  warningText:      { fontSize: 12, flex: 1 },

  sectionLabel:     { marginBottom: 8, marginTop: 4 },
  sectionTitle:     { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

  filterScroll:     { marginBottom: 14 },
  filterContent:    { gap: 8, paddingRight: 4 },
  filterChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterChipText:   { fontSize: 13, fontWeight: "500" },

  gameCard:         { borderRadius: 16, padding: 16, marginBottom: 12 },
  gameCardTop:      { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  gameIconBg:       { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 },
  gameCardInfo:     { flex: 1 },
  gameName:         { fontSize: 16, fontWeight: "700" },
  gamePattern:      { fontSize: 12, marginTop: 2 },
  gameDesc:         { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  bestScoreRow:     { flexDirection: "row", alignItems: "center", gap: 5, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, marginBottom: 10 },
  bestScoreText:    { fontSize: 12 },
  audioRow:         { flexDirection: "row", gap: 4, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, marginBottom: 10 },
  audioToggle:      { flex: 1, alignItems: "center", gap: 4 },
  audioToggleText:  { fontSize: 10, fontWeight: "500", textAlign: "center" },
  gameCardActions:  { flexDirection: "row", gap: 10 },
  howToBtn:         { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  howToText:        { fontSize: 13 },
  playBtn:          { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  playBtnText:      { color: "#fff", fontSize: 14, fontWeight: "700" },

  leaderboardCard:  { borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  leaderboardRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  leaderboardRank:  { fontSize: 16, width: 36 },
  leaderboardName:  { flex: 1, fontSize: 14, fontWeight: "500" },
  leaderboardScore: { fontSize: 14, fontWeight: "700" },
  seeAllBtn:        { paddingVertical: 12, alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth },
  seeAllText:       { fontSize: 13, fontWeight: "600" },
  emptyText:        { textAlign: "center", padding: 16, fontSize: 13 },

  modalBackdrop:    { flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" },
  modalSheet:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, maxHeight: "82%" },
  modalHandle:      { width: 42, height: 4, borderRadius: 999, alignSelf: "center", marginBottom: 14 },
  modalHeader:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalTitle:       { fontSize: 20, fontWeight: "700" },
  modalSubtitle:    { fontSize: 12, marginTop: 4 },
  periodTabs:       { flexDirection: "row", borderRadius: 14, padding: 4, marginBottom: 12 },
  periodTab:        { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  periodTabActive:  {},
  periodTabText:    { fontSize: 13, fontWeight: "600" },
  modalList:        { flexGrow: 0 },
  modalListContent: { paddingBottom: 12 },
  modalCloseBtn:    { height: 46, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 8 },
  modalCloseBtnText:{ fontSize: 14, fontWeight: "600" },
});
