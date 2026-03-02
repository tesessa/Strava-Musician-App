import { useState, useEffect, useCallback } from "react";
import {
  type PersistedSession,
  loadSession,
  saveSession,
} from "./practiceStorage";


export function usePracticeSession() {
  const [session, setSession] = useState<PersistedSession>(() => {
    const saved = loadSession();
    if (saved) return saved;
    const fresh: PersistedSession = {
      startTimestamp: Date.now(),
      pausedMs:       0,
      pausedAt:       null,
      instrument:     "",
    };
    saveSession(fresh);
    return fresh;
  });

  const isPaused = session.pausedAt !== null;

  const getElapsedMs = useCallback(() => {
    if (session.pausedAt !== null) {
      return session.pausedAt - session.startTimestamp - session.pausedMs;
    }
    return Date.now() - session.startTimestamp - session.pausedMs;
  }, [session]);

  const [displaySeconds, setDisplaySeconds] = useState(() =>
    Math.floor(getElapsedMs() / 1000)
  );

  // Tick every 500ms when running
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setDisplaySeconds(Math.floor(getElapsedMs() / 1000)), 500);
    return () => clearInterval(id);
  }, [isPaused, getElapsedMs]);

  const updateSession = (patch: Partial<PersistedSession>) => {
    setSession((prev) => {
      const updated = { ...prev, ...patch };
      saveSession(updated);
      return updated;
    });
  };

  const handlePause = () => updateSession({ pausedAt: Date.now() });

  const handleResume = () => {
    if (session.pausedAt !== null) {
      updateSession({
        pausedMs: session.pausedMs + (Date.now() - session.pausedAt),
        pausedAt: null,
      });
    }
  };

  const updateInstrument = (value: string) => updateSession({ instrument: value });

  return {
    session,
    isPaused,
    displaySeconds,
    handlePause,
    handleResume,
    updateInstrument,
  };
}