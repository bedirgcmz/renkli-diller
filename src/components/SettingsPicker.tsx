import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ThemeColors } from "@/providers/ThemeProvider";
import type { SupportedLanguage } from "@/types";
import { StyleSheet } from "react-native";

// ─── Time options ─────────────────────────────────────────────────────────────

export const TIME_OPTIONS = [
  "07:00", "08:00", "09:00", "10:00", "12:00", "14:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
];

// ─── Language options ─────────────────────────────────────────────────────────

export const SETTINGS_LANGUAGE_OPTIONS: Array<{
  value: SupportedLanguage;
  label: string;
  flag: string;
}> = [
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "sv", label: "Svenska", flag: "🇸🇪" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "pt", label: "Português", flag: "🇧🇷" },
];

// ─── TimePicker ───────────────────────────────────────────────────────────────

interface TimePickerProps {
  value: string;
  onChange: (v: string) => void;
  colors: ThemeColors;
}

export function TimePicker({ value, onChange, colors }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.pickerBtnText, { color: colors.text }]}>{value}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]} onPress={() => {}}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.pickerOption,
                  opt === value && { backgroundColor: colors.primary + "15" },
                ]}
                onPress={() => { onChange(opt); setOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerOptionText, { color: opt === value ? colors.primary : colors.text }]}>
                  {opt}
                </Text>
                {opt === value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── LangPicker ───────────────────────────────────────────────────────────────

interface LangPickerProps {
  value: SupportedLanguage;
  onChange: (v: SupportedLanguage) => void;
  colors: ThemeColors;
}

export function LangPicker({ value, onChange, colors }: LangPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = SETTINGS_LANGUAGE_OPTIONS.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.pickerBtnText, { color: colors.text }]}>
          {selected?.flag} {selected?.label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]} onPress={() => {}}>
            {SETTINGS_LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.pickerOption,
                  opt.value === value && { backgroundColor: colors.primary + "15" },
                ]}
                onPress={() => { onChange(opt.value); setOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerOptionText, { color: opt.value === value ? colors.primary : colors.text }]}>
                  {opt.flag} {opt.label}
                </Text>
                {opt.value === value && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Shared styles (pixel-perfect match with sStyles in SettingsScreen) ──────

const styles = StyleSheet.create({
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerBtnText: { fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalSheet: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerOptionText: { fontSize: 14 },
});
