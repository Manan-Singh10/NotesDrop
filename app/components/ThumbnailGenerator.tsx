"use client";

import { generateThumbnailFromCanvas } from "@/lib/client-thumbnail-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ThumbnailGeneratorProps {
  noteId: string;
  canvasRef: React.RefObject<HTMLElement>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function ThumbnailGenerator({ 
  noteId, 
  canvasRef, 
  onSuccess, 
  onError 
}: ThumbnailGeneratorProps) {
  const queryClient = useQueryClient();

  const generateThumbnailMutation = useMutation({
    mutationFn: async () => {
      if (!canvasRef.current) {
        throw new Error('Canvas element not found');
      }

      // Generate thumbnail from the canvas
      const thumbnailDataUrl = await generateThumbnailFromCanvas(canvasRef.current, {
        width: 400,
        height: 200,
        quality: 0.8
      });

      // Send thumbnail to server
      const response = await fetch(`/api/notes/${noteId}/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailDataUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to save thumbnail');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Thumbnail generation failed:', error);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  });

  return {
    generateThumbnail: generateThumbnailMutation.mutate,
    isGenerating: generateThumbnailMutation.isPending,
    error: generateThumbnailMutation.error
  };
}
