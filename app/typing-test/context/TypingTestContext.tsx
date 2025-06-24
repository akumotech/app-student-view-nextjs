"use client";
import React, { createContext, useMemo, useState, useContext } from "react";

interface TypingTestContextType {
  wpm: number;
  setWpm: (wpm: number) => void;
  cpm: number;
  setCpm: (cpm: number) => void;
  accuracy: number;
  setAccuracy: (accuracy: number) => void;
  timer: number;
  setTimer: (timer: number | ((prevTimer: number) => number)) => void;
}

const TypingTestContext = createContext<TypingTestContextType | undefined>(undefined);

export const TypingTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wpm, setWpm] = useState<number>(0);
  const [cpm, setCpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [timer, setTimer] = useState<number>(60);
  const value = useMemo(
    () => ({ wpm, setWpm, cpm, setCpm, accuracy, setAccuracy, timer, setTimer }),
    [wpm, cpm, accuracy, timer]
  );
  return <TypingTestContext.Provider value={value}>{children}</TypingTestContext.Provider>;
};

export function useTypingTestContext() {
  const context = useContext(TypingTestContext);
  if (!context) throw new Error("useTypingTestContext must be used within TypingTestProvider");
  return context;
} 