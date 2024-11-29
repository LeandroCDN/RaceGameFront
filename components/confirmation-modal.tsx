import { MiniKit } from "@worldcoin/minikit-js";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useGame } from "./game-provider";

const ConfirmationModal = ({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-50">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <p>
                You&apos;re about to buy a ticket for <strong>TEAM NAME</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Prizes will be paid relative to your team&apos;s final position.
                Race results will be announced when all slots have been filled.
              </p>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleClose}>
              Return
            </Button>
            <Button
              onClick={() => {
                onConfirm(); // Llama a la función pasada como prop
              }}
            >
              Confirm
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  );
};

export default ConfirmationModal;
