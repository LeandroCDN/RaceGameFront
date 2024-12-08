"use client";

import { createContext, useContext, useState } from "react";

interface GameContextType {
  credits: number;
  selectedTeam: string | null;
  setSelectedTeam: (team: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [credits] = useState(6.32);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  return (
    <GameContext.Provider
      value={{
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
