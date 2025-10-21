import { UpdateBlockPayload, UpdateContentPayload } from "../validators/blocks";

export async function getBlocksByNoteId(noteId: string, pageNumber?: number) {
  const url = pageNumber 
    ? `/api/blocks?noteId=${noteId}&page=${pageNumber}`
    : `/api/blocks?noteId=${noteId}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch blocks");
  return res.json();
}

export async function updateBlock(payload: UpdateBlockPayload) {
  const response = await fetch("/api/blocks", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update block");
  }

  return result;
}

export async function updateContent(payload: UpdateContentPayload) {
  const response = await fetch("/api/blocks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update content");
  }
  return result;
}

export async function createBlock(payload: {
  noteId: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  page?: number;
}) {
  const response = await fetch("/api/blocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to create block");
  }
  return result;
}

export async function deleteBlock(blockId: string) {
  const response = await fetch(`/api/blocks?blockId=${blockId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete block");
  }
  return result;
}