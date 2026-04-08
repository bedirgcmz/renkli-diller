export type BgTrackId = "bg1" | "bg2" | "bg3" | "bg4" | "bg5";
export type SfxKey = "correct" | "wrong" | "lifeLost" | "missed" | "levelUp" | "finish";

export interface BgTrack {
  id: BgTrackId;
  name: string;
  source: number;
}

export const BG_TRACKS: Record<BgTrackId, BgTrack> = {
  bg1: { id: "bg1", name: "Neon Beat",   source: require("../../assets/sounds/bg_game_1.mp3") },
  bg2: { id: "bg2", name: "Zen Flow",    source: require("../../assets/sounds/bg_game_2.mp3") },
  bg3: { id: "bg3", name: "Epic Quest",  source: require("../../assets/sounds/bg_game_3.mp3") },
  bg4: { id: "bg4", name: "Chill Mode",  source: require("../../assets/sounds/bg_game_4.mp3") },
  bg5: { id: "bg5", name: "Retro Vibes", source: require("../../assets/sounds/bg_game_5.mp3") },
};

export const BG_TRACK_LIST: BgTrack[] = Object.values(BG_TRACKS);

export const SFX_SOURCES: Record<SfxKey, number> = {
  correct:  require("../../assets/sounds/sfx_success.mp3"),
  wrong:    require("../../assets/sounds/sfx_wrong.mp3"),
  lifeLost: require("../../assets/sounds/sfx_life_lost.mp3"),
  missed:   require("../../assets/sounds/sfx_missed.mp3"),
  levelUp:  require("../../assets/sounds/level_up.mp3"),
  finish:   require("../../assets/sounds/game_finish.mp3"),
};
