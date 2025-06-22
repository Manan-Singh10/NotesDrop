"use client";

import NoteCard from "./NoteCard";
import { useQuery } from "@tanstack/react-query";
import { Note } from "@/lib/validators/notes";
import NoteContainerHeader from "./NoteContainerHeader";
import NotesContainerLoader from "@/components/ui/NotesContainerLoader";
import Link from "next/link";

const NotesContainer = () => {
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("api/notes");
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
  });

  if (isLoading) return <NotesContainerLoader />;

  return (
    <>
      <NoteContainerHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {notes.map((note) => (
          <Link href={`/editor/${note.id}`} key={note.id}>
            <NoteCard
              title={note.title}
              updateAt={note.updated_at}
              noteId={note.id}
            />
          </Link>
        ))}
      </div>
    </>
  );
};

export default NotesContainer;
