"use client";

import { Button } from "@/components/ui/button";
import UserGreetText from "@/components/ui/UserGreetText";
import { createNote } from "@/lib/api/notes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { MdCancel } from "react-icons/md";

const NoteContainerHeader = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: async ({ title }: { title: string }) => createNote(title),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setTitle("");
      setIsCreating(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createNoteMutation.mutate({ title });
  };

  return (
    <div className="flex items-center justify-between w-[90%]">
      <UserGreetText />
      {isCreating ? (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            className="bg-stone-200 px-2 py-1 text-sm rounded w-60"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={!title.trim() || createNoteMutation.isPending}
            className="bg-blue-700 text-white px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
          <MdCancel
            type="button"
            size={22}
            onClick={() => setIsCreating(false)}
          />
        </form>
      ) : (
        <Button onClick={() => setIsCreating(true)} className="cursor-pointer">
          Create New
        </Button>
      )}
    </div>
  );
};

export default NoteContainerHeader;
