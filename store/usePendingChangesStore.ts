import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BlockPendingChange {
  blockId: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  content?: { text: string };
}

// pending[noteId][blockId] = merged latest change for that block
type PendingMap = Record<string, Record<string, BlockPendingChange>>;

interface PendingChangesStore {
  pending: PendingMap;
  isSaving: boolean;
  lastSavedAt: number | null;

  queueChange: (noteId: string, change: BlockPendingChange) => void;
  clearPending: (noteId: string) => void;
  setIsSaving: (v: boolean) => void;
  setLastSavedAt: (ts: number) => void;
}

export const usePendingChangesStore = create<PendingChangesStore>()(
  persist(
    (set) => ({
      pending: {},
      isSaving: false,
      lastSavedAt: null,

      queueChange(noteId, change) {
        set((state) => ({
          pending: {
            ...state.pending,
            [noteId]: {
              ...state.pending[noteId],
              // Deep-merge so a content update doesn't wipe a position update
              [change.blockId]: {
                ...state.pending[noteId]?.[change.blockId],
                ...change,
              },
            },
          },
        }));
      },

      clearPending(noteId) {
        set((state) => {
          const next = { ...state.pending };
          delete next[noteId];
          return { pending: next };
        });
      },

      setIsSaving(v) {
        set({ isSaving: v });
      },

      setLastSavedAt(ts) {
        set({ lastSavedAt: ts });
      },
    }),
    {
      name: "notesdrop-pending-changes",
      // Only persist the actual pending map — isSaving/lastSavedAt are transient
      partialize: (state) => ({ pending: state.pending }),
    }
  )
);
