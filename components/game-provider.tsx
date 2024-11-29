"use client";

import { createContext, useContext, useState } from "react";

interface GameContextType {
  screen: "main" | "team" | "confirmation" | "result";
  setScreen: (screen: "main" | "team" | "confirmation" | "result") => void;
  credits: number;
  selectedTeam: string | null;
  setSelectedTeam: (team: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<
    "main" | "team" | "confirmation" | "result"
  >("main");
  const [credits] = useState(6.32);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  return (
    <GameContext.Provider
      value={{
        screen,
        setScreen,
        credits,
        selectedTeam,
        setSelectedTeam,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
