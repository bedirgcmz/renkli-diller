import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";

const SPOTLIGHT_PADDING = 10;
const TOOLTIP_MARGIN = 14;
const TOOLTIP_H_ESTIMATE = 160;

export interface CoachMarkStep {
  /** Pass a View ref OR a pre-calculated layout (for e.g. tab bar items). */
  ref?: React.RefObject<View>;
  layout?: { x: number; y: number; width: number; height: number };
  title: string;
  description: string;
}

interface Props {
  steps: CoachMarkStep[];
  visible: boolean;
  onDone: () => void;
  onSkip: () => void;
  /** Called just before a step is measured — use to pre-scroll to the target. */
  onBeforeStep?: (index: number) => void;
}

export function CoachMarksOverlay({ steps, visible, onDone, onSkip, onBeforeStep }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width: SW, height: SH } = useWindowDimensions();

  const [stepIndex, setStepIndex] = useState(0);
  const [spotLayout, setSpotLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  // Measure or read layout when step changes
  useEffect(() => {
    if (!visible || !step) return;
    setSpotLayout(null);
    fadeAnim.setValue(0);

    onBeforeStep?.(stepIndex);

    const measure = () => {
      if (step.layout) {
        setSpotLayout(step.layout);
      } else if (step.ref?.current) {
        step.ref.current.measureInWindow((x, y, w, h) => {
          setSpotLayout({ x, y, width: w, height: h });
        });
      }
    };
    const t1 = setTimeout(measure, 200);
    return () => clearTimeout(t1);
  }, [stepIndex, visible]);

  // Fade in when layout arrives
  useEffect(() => {
    if (!spotLayout) return;
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [spotLayout]);

  // Reset index when becoming visible
  useEffect(() => {
    if (visible) setStepIndex(0);
  }, [visible]);

  if (!visible || !step || !spotLayout) return null;

  const { x, y, width, height } = spotLayout;
  const sp = SPOTLIGHT_PADDING;

  const spotX = Math.max(0, x - sp);
  const spotY = Math.max(0, y - sp);
  const spotW = Math.min(width + sp * 2, SW - spotX);
  const spotH = height + sp * 2;

  // Tooltip: prefer below, fallback above
  const spaceBelow = SH - (spotY + spotH);
  const showBelow = spaceBelow >= TOOLTIP_H_ESTIMATE + TOOLTIP_MARGIN;
  const tooltipTop = showBelow
    ? spotY + spotH + TOOLTIP_MARGIN
    : spotY - TOOLTIP_H_ESTIMATE - TOOLTIP_MARGIN;

  const handleNext = () => {
    if (isLast) {
      onDone();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.root, { opacity: fadeAnim }]} pointerEvents="box-none">
        {/* 4-quadrant dim overlay */}
        <View style={[styles.dim, { top: 0, left: 0, right: 0, height: spotY }]} />
        <View style={[styles.dim, { top: spotY + spotH, left: 0, right: 0, bottom: 0 }]} />
        <View style={[styles.dim, { top: spotY, left: 0, width: spotX, height: spotH }]} />
        <View
          style={[styles.dim, { top: spotY, left: spotX + spotW, right: 0, height: spotH }]}
        />

        {/* Tap-blocker over the spotlight area itself (prevents accidental navigation) */}
        <View
          style={{
            position: "absolute",
            top: spotY,
            left: spotX,
            width: spotW,
            height: spotH,
          }}
        />

        {/* Tooltip */}
        <View
          style={[
            styles.tooltip,
            {
              top: tooltipTop,
              backgroundColor: colors.cardBackground,
              shadowColor: colors.text,
            },
          ]}
        >
          {/* Counter */}
          <Text style={[styles.counter, { color: colors.textTertiary }]}>
            {stepIndex + 1} / {steps.length}
          </Text>

          <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>{step.description}</Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.skipText, { color: colors.textTertiary }]}>
                {t("coach_marks.skip")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>
                {isLast ? t("coach_marks.done") : t("coach_marks.next")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  dim: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.68)",
  },
  tooltip: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 18,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
  },
  counter: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  nextBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
