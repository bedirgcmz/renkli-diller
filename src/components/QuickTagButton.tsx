import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { SentenceTag } from "@/types";
import { TAG_OPTIONS, TAG_GROUPS } from "@/utils/constants";
import { useProgressStore } from "@/store/useProgressStore";
import { useSentenceStore } from "@/store/useSentenceStore";

interface QuickTagButtonProps {
  sentenceId: string;
  isPreset: boolean;
  /** Only renders for "learning" status */
  status: "new" | "learning" | "learned";
}

export function QuickTagButton({ sentenceId, isPreset, status }: QuickTagButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);

  const { tagMap, updatePresetTag } = useProgressStore();
  const { sentences, updateSentence } = useSentenceStore();

  // Only show for learning sentences
  if (status !== "learning") return null;

  const currentTag: SentenceTag | null = isPreset
    ? (tagMap[sentenceId] ?? null)
    : (sentences.find((s) => s.id === sentenceId)?.tag ?? null);

  const handleSelect = async (tag: SentenceTag | null) => {
    setSheetVisible(false);
    if (isPreset) {
      await updatePresetTag(sentenceId, tag);
    } else {
      await updateSentence(sentenceId, { tag });
    }
  };

  const currentOpt = currentTag ? TAG_OPTIONS.find((o) => o.value === currentTag) : null;
  const hasTag = currentTag != null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setSheetVisible(true)}
        activeOpacity={0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons
          name={hasTag ? "pricetag" : "pricetag-outline"}
          size={16}
          color={hasTag ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>

      <TagSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        currentTag={currentTag}
        onSelect={handleSelect}
      />
    </>
  );
}

// ─── Tag Sheet ────────────────────────────────────────────────────────────────

interface TagSheetProps {
  visible: boolean;
  onClose: () => void;
  currentTag: SentenceTag | null;
  onSelect: (tag: SentenceTag | null) => void;
}

function TagSheet({ visible, onClose, currentTag, onSelect }: TagSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const getOptionByValue = (value: SentenceTag) => TAG_OPTIONS.find((o) => o.value === value)!;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.cardBackground }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t("tags.tag_sentence")}</Text>
          {currentTag && (
            <TouchableOpacity onPress={() => onSelect(null)} style={styles.removeBtn}>
              <Ionicons name="close-circle-outline" size={15} color={colors.textSecondary} />
              <Text style={[styles.removeText, { color: colors.textSecondary }]}>
                {t("tags.tag_remove")}
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
                  const active = currentTag === tagValue;
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
                      onPress={() => onSelect(active ? null : tagValue)}
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
                        <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
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
    paddingBottom: 34,
    maxHeight: "75%",
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
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  removeText: {
    fontSize: 13,
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
});
