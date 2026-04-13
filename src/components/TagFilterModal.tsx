import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { SentenceTag } from "@/types";
import { TAG_OPTIONS, TAG_GROUPS } from "@/utils/constants";

interface TagFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTags: SentenceTag[];
  onApply: (tags: SentenceTag[]) => void;
  /** Returns how many sentences match the given draft selection */
  getMatchCount?: (draft: SentenceTag[]) => number;
}

export function TagFilterModal({
  visible,
  onClose,
  selectedTags,
  onApply,
  getMatchCount,
}: TagFilterModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<SentenceTag[]>(selectedTags);

  useEffect(() => {
    if (visible) setDraft(selectedTags);
  }, [visible]);

  const toggle = (tag: SentenceTag) => {
    setDraft((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClear = () => setDraft([]);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const getOptionByValue = (value: SentenceTag) =>
    TAG_OPTIONS.find((o) => o.value === value)!;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.cardBackground,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("tags.filter_title")}
          </Text>
          {draft.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Text style={[styles.clearText, { color: colors.textSecondary }]}>
                {t("tags.filter_clear")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {TAG_GROUPS.map((group) => (
            <View key={group.labelKey} style={styles.group}>
              <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>
                {t(group.labelKey).toUpperCase()}
              </Text>
              <View style={styles.chipRow}>
                {group.tags.map((tagValue) => {
                  const opt = getOptionByValue(tagValue);
                  const active = draft.includes(tagValue);
                  return (
                    <TouchableOpacity
                      key={tagValue}
                      style={[
                        styles.chip,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active
                            ? colors.primary + "18"
                            : colors.backgroundSecondary,
                        },
                      ]}
                      onPress={() => toggle(tagValue)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={opt.icon as any}
                        size={14}
                        color={active ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          { color: active ? colors.primary : colors.textSecondary },
                        ]}
                      >
                        {t(opt.i18nKey)}
                      </Text>
                      {active && (
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Apply button */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.divider,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Text style={styles.applyBtnText}>
              {draft.length === 0
                ? t("tags.filter_show_all")
                : t("tags.filter_show_results", {
                    tagCount: draft.length,
                    sentenceCount: getMatchCount ? getMatchCount(draft) : draft.length,
                  })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/** Small trigger button shown in screen headers */
interface FilterButtonProps {
  activeCount: number;
  onPress: () => void;
}

export function FilterButton({ activeCount, onPress }: FilterButtonProps) {
  const { colors } = useTheme();
  const hasFilter = activeCount > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterBtn,
        {
          backgroundColor: hasFilter ? colors.primary + "18" : colors.backgroundSecondary,
          borderColor: hasFilter ? colors.primary : colors.border,
        },
      ]}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name="options-outline"
        size={16}
        color={hasFilter ? colors.primary : colors.textSecondary}
      />
      {hasFilter && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{activeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  clearBtn: {
    paddingHorizontal: 4,
  },
  clearText: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 20,
  },
  group: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  applyBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
