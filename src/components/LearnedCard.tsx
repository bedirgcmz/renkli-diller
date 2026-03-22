import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { GradientView } from "@/components/GradientView";
import { KeywordText } from "@/components/KeywordText";
import { Sentence } from "@/types";

interface LearnedCardProps {
  sentence: Sentence;
  onForgot: () => void;
  colors: any;
  t: (k: string) => string;
}

export const LearnedCard = React.memo(function LearnedCard({
  sentence,
  onForgot,
  colors,
  t,
}: LearnedCardProps) {
  const colorSeed = String(sentence.id);
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      {/* Green left stripe */}
      <GradientView
        colors={["#49C98A", "#6EE7B7"]}
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
        <View style={styles.cardFooter}>
          {sentence.category_name ? (
            <View style={[styles.chip, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                {sentence.category_name}
              </Text>
            </View>
          ) : null}
          <Pressable
            onPress={onForgot}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
              marginLeft: "auto",
            })}
          >
            {({ pressed }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: pressed
                    ? colors.backgroundTertiary
                    : colors.backgroundSecondary,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                  {t("learn.mark_unlearned")}
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
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 5,
  },
});
