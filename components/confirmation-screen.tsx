"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useGame } from "./game-provider";
import { useState } from "react";

export function ConfirmationScreen({ onConfirm }: { onConfirm: () => void }) {
  const { screen, setScreen, selectedTeam } = useGame();
  const [closeModal, setCloseModal] = useState(false);
  if (screen !== "confirmation") return null;

  const handleCloseModal = () => {
    setCloseModal(true); // If needed for internal close handling
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <CardContent className="pt-6">
        <div className="space-y-4 text-center">
          <p>
            You&apos;re about to buy a ticket for{" "}
            <strong>{selectedTeam}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Prizes will be paid relative to your team&apos;s final position.
            Race results will be announced when all slots have been filled.
          </p>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4">
        <Button variant="outline">Return</Button>
        <Button
          onClick={() => {
            onConfirm(); // Llama a la función pasada como prop
          }}
        >
          Confirm
        </Button>
      </CardFooter>
    </div>
  );
}
