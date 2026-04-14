import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BG_TRACK_LIST } from "@/audio/audioAssets";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  visible: boolean;
  initialTrackId: string;
  onConfirm: (trackId: string) => void;
  onCancel: () => void;
}

export function BGMusicPickerModal({ visible, initialTrackId, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState(initialTrackId);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const previewPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedId(initialTrackId);
    } else {
      _stopPreview();
    }
  }, [visible, initialTrackId]);

  useEffect(() => () => _stopPreview(), []);

  function _stopPreview() {
    if (previewPlayerRef.current) {
      try { previewPlayerRef.current.pause(); } catch {}
      try { previewPlayerRef.current.remove(); } catch {}
      previewPlayerRef.current = null;
    }
    setPreviewingId(null);
  }

  function handlePreview(trackId: string) {
    if (previewingId === trackId) {
      _stopPreview();
      return;
    }
    _stopPreview();

    const track = BG_TRACK_LIST.find((t) => t.id === trackId);
    if (!track) return;

    try {
      setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "duckOthers", allowsRecording: false, shouldPlayInBackground: false, shouldRouteThroughEarpiece: false }).catch(() => {});
      const player = createAudioPlayer(track.source, { keepAudioSessionActive: true });
      player.volume = 0.6;
      player.loop = true;
      player.play();
      previewPlayerRef.current = player;
      setPreviewingId(trackId);
    } catch {}
  }

  function handleConfirm() {
    _stopPreview();
    onConfirm(selectedId);
  }

  function handleCancel() {
    _stopPreview();
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleCancel}>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.cardBackground,
              paddingBottom: Math.max(insets.bottom, 16) + 20,
            },
          ]}
        >
          {/* Header */}
          <Text style={[styles.title, { color: colors.text }]}>
            {t("games.audio.music_title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("games.audio.music_subtitle")}
          </Text>

          {/* Track list */}
          {BG_TRACK_LIST.map((track) => {
            const isSelected = selectedId === track.id;
            const isPreviewing = previewingId === track.id;
            return (
              <TouchableOpacity
                key={track.id}
                style={[
                  styles.trackRow,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + "12" : "transparent",
                  },
                ]}
                onPress={() => setSelectedId(track.id)}
                activeOpacity={0.7}
              >
                <View style={styles.trackLeft}>
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                    size={20}
                    color={isSelected ? colors.primary : colors.textTertiary}
                  />
                  <Text style={[styles.trackName, { color: colors.text }]}>
                    {track.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handlePreview(track.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isPreviewing ? "stop-circle" : "play-circle-outline"}
                    size={30}
                    color={isPreviewing ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

          {/* Preview label */}
          {previewingId && (
            <Text style={[styles.previewHint, { color: colors.textSecondary }]}>
              {t("games.audio.preview_hint")}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  trackLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  trackName: {
    fontSize: 15,
    fontWeight: "500",
  },
  previewHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
