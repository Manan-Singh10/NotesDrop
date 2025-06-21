export async function updateTitle(noteId: string, newTitle: string) {
  const res = await fetch("/api/notes", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noteId, newTitle: newTitle }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Failed to update title");
  }
  return res.json();
}

export async function createNote(title: string) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Failed to create new note");
  }
  return res.json();
}
