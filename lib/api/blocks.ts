import { UpdateBlockPayload, UpdateContentPayload } from "../validators/blocks";

export async function getBlocksByNoteId(noteId: string) {
  const res = await fetch(`/api/blocks?noteId=${noteId}`);
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
  console.log(payload);
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
