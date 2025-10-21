// Thumbnail generation scheduler to avoid generating thumbnails too frequently
class ThumbnailScheduler {
  private pendingUpdates = new Map<string, NodeJS.Timeout>();
  private readonly DEBOUNCE_DELAY = 5000; // 5 seconds delay

  scheduleThumbnailUpdate(noteId: string, callback: () => Promise<void>) {
    // Clear existing timeout for this note
    const existingTimeout = this.pendingUpdates.get(noteId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new thumbnail generation
    const timeout = setTimeout(async () => {
      try {
        await callback();
      } catch (error) {
        console.error(`Failed to generate thumbnail for note ${noteId}:`, error);
      } finally {
        this.pendingUpdates.delete(noteId);
      }
    }, this.DEBOUNCE_DELAY);

    this.pendingUpdates.set(noteId, timeout);
  }

  cancelPendingUpdate(noteId: string) {
    const timeout = this.pendingUpdates.get(noteId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingUpdates.delete(noteId);
    }
  }
}

export const thumbnailScheduler = new ThumbnailScheduler();
