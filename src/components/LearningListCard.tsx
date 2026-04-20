import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { GradientView } from "@/components/GradientView";
import { KeywordText } from "@/components/KeywordText";
import { Sentence } from "@/types";

interface LearningListCardProps {
  sentence: Sentence;
  onMarkLearned: () => void;
  onRemove: () => void;
  colors: any;
  t: (k: string) => string;
}

export const LearningListCard = React.memo(function LearningListCard({
  sentence,
  onMarkLearned,
  onRemove,
  colors,
  t,
}: LearningListCardProps) {
  const colorSeed = String(sentence.id);
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      {/* Blue left stripe */}
      <GradientView
        colors={["#3B82F6", "#60A5FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.stripe}
      />
      <View style={styles.body}>
        <KeywordText
          text={sentence.source_text}
          baseColor={colors.text}
          fontSize={15}
          fontWeight="500"
          colorSeed={colorSeed}
        />
        <View style={{ marginTop: 4 }}>
          <KeywordText
            text={sentence.target_text}
            baseColor={colors.textSecondary}
            fontSize={13}
            colorSeed={colorSeed}
          />
        </View>
        {sentence.category_name ? (
          <View style={[styles.chip, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              {sentence.category_name}
            </Text>
          </View>
        ) : null}
        {/* Actions row — separate line so both CTAs fit */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={onMarkLearned}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }], flex: 1 })}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.btn,
                  {
                    backgroundColor: pressed ? "#3B82F6" : "#3B82F618",
                    borderColor: "#3B82F6",
                  },
                ]}
              >
                <Text style={{ color: "#3B82F6", fontSize: 12, fontWeight: "700" }}>
                  {t("learn.mark_learned")}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={onRemove}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }], flex: 1 })}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.btn,
                  {
                    backgroundColor: pressed
                      ? colors.backgroundTertiary
                      : colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                  {t("learn.remove_from_list")}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  stripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 12,
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 5,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  btn: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
});
