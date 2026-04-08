import { useEffect, useRef, useCallback } from "react";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { BG_TRACKS, BgTrackId, SFX_SOURCES, SfxKey } from "./audioAssets";

// Configure audio session once at startup
let audioModeConfigured = false;
function ensureAudioMode() {
  if (audioModeConfigured) return;
  audioModeConfigured = true;
  setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: "duckOthers",
    allowsRecording: false,
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  }).catch(() => {});
}

export type { SfxKey };

interface UseGameAudioParams {
  bgMusicEnabled: boolean;
  sfxEnabled: boolean;
  bgTrackId: string;
  /** Pass true when phase === "playing", false otherwise. Hook auto-pauses/resumes BG. */
  gameActive: boolean;
}

export function useGameAudio({
  bgMusicEnabled,
  sfxEnabled,
  bgTrackId,
  gameActive,
}: UseGameAudioParams) {
  const bgPlayerRef = useRef<AudioPlayer | null>(null);
  const sfxPlayersRef = useRef<Partial<Record<SfxKey, AudioPlayer>>>({});
  const currentBgTrackIdRef = useRef<string>("");
  const mountedRef = useRef(true);

  // Latest values via refs so callbacks never go stale
  const bgMusicEnabledRef = useRef(bgMusicEnabled);
  const sfxEnabledRef = useRef(sfxEnabled);
  const bgTrackIdRef = useRef(bgTrackId);
  const gameActiveRef = useRef(gameActive);
  bgMusicEnabledRef.current = bgMusicEnabled;
  sfxEnabledRef.current = sfxEnabled;
  bgTrackIdRef.current = bgTrackId;
  gameActiveRef.current = gameActive;

  // ---- Initialize on mount ----
  useEffect(() => {
    ensureAudioMode();
    mountedRef.current = true;

    // Pre-create all SFX players to eliminate playback latency
    const sfxKeys = Object.keys(SFX_SOURCES) as SfxKey[];
    sfxKeys.forEach((key) => {
      try {
        const player = createAudioPlayer(SFX_SOURCES[key], {
          keepAudioSessionActive: true, // SFX won't kill BG session
        });
        player.volume = 0.8;
        sfxPlayersRef.current[key] = player;
      } catch {}
    });

    return () => {
      mountedRef.current = false;
      _destroyBg();
      _destroySfx();
    };
  }, []);

  function _destroyBg() {
    if (bgPlayerRef.current) {
      try { bgPlayerRef.current.pause(); } catch {}
      try { bgPlayerRef.current.remove(); } catch {}
      bgPlayerRef.current = null;
    }
    currentBgTrackIdRef.current = "";
  }

  function _destroySfx() {
    const players = sfxPlayersRef.current;
    (Object.keys(players) as SfxKey[]).forEach((key) => {
      try { players[key]?.pause(); } catch {}
      try { players[key]?.remove(); } catch {}
    });
    sfxPlayersRef.current = {};
  }

  function _createBgPlayer(trackId: string) {
    const track = BG_TRACKS[trackId as BgTrackId] ?? BG_TRACKS["bg1"];
    try {
      const player = createAudioPlayer(track.source);
      player.volume = 0.4;
      player.loop = true; // ← loop throughout game
      player.play();
      bgPlayerRef.current = player;
      currentBgTrackIdRef.current = trackId;
    } catch {}
  }

  // ---- React to bgMusicEnabled toggle ----
  useEffect(() => {
    if (!bgMusicEnabled) {
      try { bgPlayerRef.current?.pause(); } catch {}
    } else if (gameActiveRef.current && bgPlayerRef.current) {
      try { bgPlayerRef.current.play(); } catch {}
    }
  }, [bgMusicEnabled]);

  // ---- React to gameActive (pause/resume game) ----
  useEffect(() => {
    if (!bgMusicEnabledRef.current) return;
    if (!gameActive) {
      try { bgPlayerRef.current?.pause(); } catch {}
    } else if (bgPlayerRef.current) {
      try { bgPlayerRef.current.play(); } catch {}
    }
  }, [gameActive]);

  // ---- Public API ----

  /** Call once when the game actually starts playing */
  const startBgMusic = useCallback(() => {
    if (!bgMusicEnabledRef.current) return;
    const trackId = bgTrackIdRef.current;

    // Same track already running — just resume
    if (currentBgTrackIdRef.current === trackId && bgPlayerRef.current) {
      try { bgPlayerRef.current.play(); } catch {}
      return;
    }

    // Different track or first start — replace
    _destroyBg();
    _createBgPlayer(trackId);
  }, []); // stable — uses only refs

  /** Call on game end */
  const stopBgMusic = useCallback(() => {
    try { bgPlayerRef.current?.pause(); } catch {}
  }, []);

  /** Play a one-shot SFX */
  const playSfx = useCallback((key: SfxKey) => {
    if (!sfxEnabledRef.current || !mountedRef.current) return;
    const player = sfxPlayersRef.current[key];
    if (!player) return;
    try {
      // Seek to start and replay; keepAudioSessionActive keeps BG untouched
      player.seekTo(0).then(() => {
        if (mountedRef.current) {
          try { player.play(); } catch {}
        }
      }).catch(() => {});
    } catch {}
  }, []); // stable

  return { startBgMusic, stopBgMusic, playSfx };
}
