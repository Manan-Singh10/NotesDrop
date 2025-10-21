export async function generateThumbnail(noteId: string) {
  const response = await fetch(`/api/notes/${noteId}/thumbnail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to generate thumbnail");
  }
  
  return result;
}

export async function getThumbnail(noteId: string) {
  const response = await fetch(`/api/notes/${noteId}/thumbnail`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch thumbnail");
  }
  
  return result;
}
