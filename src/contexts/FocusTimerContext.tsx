import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFocusService, type FocusSession } from "@/lib/focusService";

interface FocusTimerContextValue {
  sessions: FocusSession[];
  loading: boolean;
  createSession: ReturnType<typeof useFocusService>["createSession"];
  updateSession: ReturnType<typeof useFocusService>["updateSession"];
  deleteSession: ReturnType<typeof useFocusService>["deleteSession"];
  addTask: ReturnType<typeof useFocusService>["addTask"];
  toggleTaskCompletion: ReturnType<typeof useFocusService>["toggleTaskCompletion"];
  deleteTask: ReturnType<typeof useFocusService>["deleteTask"];
  activeSession: FocusSession | null;
  activeElapsedSeconds: number;
  computeSessionElapsed: (session: FocusSession) => number;
  startTimer: (sessionId: string) => Promise<boolean>;
  pauseTimer: (sessionId: string) => Promise<boolean>;
  completeTimer: (sessionId: string) => Promise<boolean>;
  resetTimer: (sessionId: string) => Promise<boolean>;
}

const FocusTimerContext = createContext<FocusTimerContextValue | undefined>(undefined);

export const FocusTimerProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    sessions,
    loading,
    createSession,
    updateSession,
    deleteSession,
    addTask,
    toggleTaskCompletion,
    deleteTask,
  } = useFocusService();

  const [now, setNow] = useState(() => Date.now());

  const activeSession = useMemo(() => sessions.find((session) => session.isRunning) ?? null, [sessions]);

  useEffect(() => {
    let interval: number | null = null;

    if (activeSession?.isRunning) {
      interval = window.setInterval(() => {
        setNow(Date.now());
      }, 1000);
    } else {
      setNow(Date.now());
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [activeSession?.isRunning]);

  const computeSessionElapsed = useCallback(
    (session: FocusSession) => {
      const base = session.elapsedSeconds ?? 0;
      if (session.isRunning && session.startedAt) {
        const diffSeconds = Math.max(0, Math.floor((now - new Date(session.startedAt).getTime()) / 1000));
        return base + diffSeconds;
      }
      return base;
    },
    [now],
  );

  const activeElapsedSeconds = activeSession ? computeSessionElapsed(activeSession) : 0;

  const startTimer = useCallback(
    async (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return false;

      const pausedSessions = sessions.filter((s) => s.isRunning && s.id !== sessionId);
      await Promise.all(
        pausedSessions.map((s) =>
          updateSession(s.id, {
            isRunning: false,
            startedAt: null,
            elapsedSeconds: computeSessionElapsed(s),
            actualMinutes: Math.round(computeSessionElapsed(s) / 60),
          }),
        ),
      );

      await updateSession(sessionId, {
        isRunning: true,
        startedAt: new Date().toISOString(),
        status: "in_progress",
      });

      return true;
    },
    [sessions, updateSession, computeSessionElapsed],
  );

  const pauseTimer = useCallback(
    async (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return false;
      const elapsed = computeSessionElapsed(session);

      await updateSession(sessionId, {
        isRunning: false,
        startedAt: null,
        elapsedSeconds: elapsed,
        actualMinutes: Math.round(elapsed / 60),
      });

      return true;
    },
    [sessions, updateSession, computeSessionElapsed],
  );

  const completeTimer = useCallback(
    async (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return false;
      const elapsed = computeSessionElapsed(session);

      await updateSession(sessionId, {
        isRunning: false,
        startedAt: null,
        elapsedSeconds: elapsed,
        actualMinutes: Math.round(elapsed / 60),
        status: "completed",
      });

      return true;
    },
    [sessions, updateSession, computeSessionElapsed],
  );

  const resetTimer = useCallback(
    async (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return false;

      await updateSession(sessionId, {
        isRunning: false,
        startedAt: null,
        elapsedSeconds: 0,
        actualMinutes: null,
        status: "planned",
      });

      return true;
    },
    [sessions, updateSession],
  );

  const value: FocusTimerContextValue = {
    sessions,
    loading,
    createSession,
    updateSession,
    deleteSession,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    activeSession,
    activeElapsedSeconds,
    computeSessionElapsed,
    startTimer,
    pauseTimer,
    completeTimer,
    resetTimer,
  };

  return <FocusTimerContext.Provider value={value}>{children}</FocusTimerContext.Provider>;
};

export const useFocusTimer = () => {
  const context = useContext(FocusTimerContext);
  if (!context) {
    throw new Error("useFocusTimer deve essere usato all'interno di FocusTimerProvider");
  }
  return context;
};
