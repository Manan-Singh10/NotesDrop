export async function getBlocksByNoteId(noteId: string) {
  const res = await fetch(`/api/blocks?noteId=${noteId}`);
  if (!res.ok) throw new Error("Failed to fetch blocks");
  return res.json();
}
