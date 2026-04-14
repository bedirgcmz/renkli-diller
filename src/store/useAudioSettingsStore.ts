import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@audio_settings_v1";

export const DEFAULT_GAME_BG_TRACK: Record<string, string> = {
  speed_round: "bg1",
  word_rain: "bg2",
  memory_match: "bg3",
};

interface AudioSettingsState {
  bgMusicEnabled: boolean;
  sfxEnabled: boolean;
  gameBgTrack: Record<string, string>; // gameId -> trackId
  loaded: boolean;

  setBgMusicEnabled: (val: boolean) => void;
  setSfxEnabled: (val: boolean) => void;
  setGameBgTrack: (gameId: string, trackId: string) => void;
  load: () => Promise<void>;
}

export const useAudioSettingsStore = create<AudioSettingsState>((set, get) => ({
  bgMusicEnabled: true,
  sfxEnabled: true,
  gameBgTrack: { ...DEFAULT_GAME_BG_TRACK },
  loaded: false,

  setBgMusicEnabled: (val) => {
    set({ bgMusicEnabled: val });
    _persist(get);
  },
  setSfxEnabled: (val) => {
    set({ sfxEnabled: val });
    _persist(get);
  },
  setGameBgTrack: (gameId, trackId) => {
    set((s) => ({ gameBgTrack: { ...s.gameBgTrack, [gameId]: trackId } }));
    _persist(get);
  },
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          bgMusicEnabled: data.bgMusicEnabled ?? true,
          sfxEnabled: data.sfxEnabled ?? true,
          gameBgTrack: {
            ...DEFAULT_GAME_BG_TRACK,
            ...(data.gameBgTrack ?? {}),
          },
        });
      }
    } catch {}
    set({ loaded: true });
  },
}));

function _persist(get: () => AudioSettingsState) {
  const { bgMusicEnabled, sfxEnabled, gameBgTrack } = get();
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ bgMusicEnabled, sfxEnabled, gameBgTrack })
  ).catch(() => {});
}
