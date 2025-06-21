"use client";

import NoteCard from "./NoteCard";
import { useQuery } from "@tanstack/react-query";
import { Note } from "@/lib/validators/notes";
import NoteContainerHeader from "./NoteContainerHeader";

const NotesContainer = () => {
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("api/notes");
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <NoteContainerHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            updateAt={note.updated_at}
            noteId={note.id}
          />
        ))}
      </div>
    </>
  );
};

export default NotesContainer;
