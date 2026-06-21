"use client";

import { useCallback, useEffect } from "react";
import { updateBlock, updateContent } from "@/lib/api/blocks";
import { usePendingChangesStore } from "@/store/usePendingChangesStore";

const AUTOSAVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function useAutosave(noteId: string) {
  const isSaving = usePendingChangesStore((s) => s.isSaving);
  const lastSavedAt = usePendingChangesStore((s) => s.lastSavedAt);
  const pending = usePendingChangesStore((s) => s.pending);

  const hasPendingChanges = Object.keys(pending[noteId] ?? {}).length > 0;

  // Read pending state directly from the store at flush time to avoid
  // stale closures and to keep the autosave interval stable.
  const flush = useCallback(async () => {
    const store = usePendingChangesStore.getState();
    const changes = store.pending[noteId];

    if (!changes || Object.keys(changes).length === 0) return;

    store.setIsSaving(true);
    try {
      await Promise.all(
        Object.values(changes).map(async (change) => {
          const { blockId, position, size, content } = change;
          const calls: Promise<unknown>[] = [];
          if (position || size) calls.push(updateBlock({ blockId, position, size }));
          if (content) calls.push(updateContent({ blockId, content }));
          return Promise.all(calls);
        })
      );
      store.clearPending(noteId);
      store.setLastSavedAt(Date.now());
    } catch (err) {
      console.error("Autosave failed:", err);
      // Do not clear pending — changes survive for next attempt
    } finally {
      store.setIsSaving(false);
    }
  }, [noteId]);

  // Fixed 10-minute interval — does not reset on every keystroke
  useEffect(() => {
    const interval = setInterval(flush, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [flush]);

  return { flush, isSaving, lastSavedAt, hasPendingChanges };
}
