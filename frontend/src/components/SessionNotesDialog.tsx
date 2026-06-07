import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface SessionNotesDialogProps {
  open: boolean;
  onSave: (notes: string) => void;
  onSkip: () => void;
}

export function SessionNotesDialog({ open, onSave, onSkip }: SessionNotesDialogProps) {
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    onSave(notes.trim());
    setNotes("");
  };

  const handleSkip = () => {
    onSkip();
    setNotes("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">Session Complete</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            Add a note about how you felt (optional)
          </Dialog.Description>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Felt calmer, less anxious..."
            maxLength={500}
            rows={3}
            className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label="Session notes"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleSave}>Save Session</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
