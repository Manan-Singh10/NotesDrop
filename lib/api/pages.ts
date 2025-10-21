export async function getPagesByNoteId(noteId: string) {
  const res = await fetch(`/api/pages?noteId=${noteId}`);
  if (!res.ok) throw new Error("Failed to fetch pages");
  return res.json();
}

export async function createPage(noteId: string) {
  const response = await fetch("/api/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noteId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to create page");
  }
  return result;
}
