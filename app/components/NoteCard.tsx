import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { deleteNote, updateTitle } from "@/lib/api/notes";
import { generateThumbnail } from "@/lib/api/thumbnails";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { MdCancel, MdDeleteOutline, MdModeEdit, MdRefresh } from "react-icons/md";

interface Props {
  title: string;
  updateAt: string;
  previewImageUrl?: string;
  noteId: string;
  thumbnailUrl?: string | null;
}

const NoteCard = ({ title, updateAt, previewImageUrl, noteId, thumbnailUrl }: Props) => {
  const [newTitle, setNewTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const queryClient = useQueryClient();

  const updateTitleMutation = useMutation({
    mutationFn: async ({ noteId, title }: { noteId: string; title: string }) =>
      updateTitle(noteId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setIsEditingTitle(false);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async ({ noteId }: { noteId: string }) => deleteNote(noteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const generateThumbnailMutation = useMutation({
    mutationFn: async ({ noteId }: { noteId: string }) => generateThumbnail(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    updateTitleMutation.mutate({ noteId, title: newTitle.trim() });
  };

  console.log(thumbnailUrl);
  return (
    <Card className="w-full max-w-sm hover:shadow-md transition-shadow duration-200 p-0 pb-3 gap-2">
      <Link href={`/editor/${noteId}`}>
        <Image
          src={thumbnailUrl || previewImageUrl || "https://picsum.photos/400/200"}
          width={300}
          height={150}
          alt="Note preview"
          priority
          className="w-full h-40 object-cover rounded-t-md cursor-pointer"
        />
      </Link>
      <CardHeader className="text-lg font-semibold truncate flex items-center gap-2">
        {isEditingTitle ? (
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 items-center w-full"
          >
            <input
              type="text"
              className="bg-stone-200 px-2 py-1 text-sm rounded w-full"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || updateTitleMutation.isPending}
              className="bg-blue-700 text-white px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Set
            </button>
            <MdCancel
              type="button"
              size={22}
              onClick={() => setIsEditingTitle(false)}
            />
          </form>
        ) : (
          <>
            <span className="flex-1 truncate">
              {title || "Untitled document"}
            </span>
            <MdModeEdit
              size={16}
              className="cursor-pointer"
              onClick={() => {
                setNewTitle(title);
                setIsEditingTitle(true);
              }}
            />
            <MdRefresh
              size={18}
              className="cursor-pointer"
              onClick={() => generateThumbnailMutation.mutate({ noteId })}
              title="Refresh thumbnail"
            />
            <MdDeleteOutline
              size={20}
              className="cursor-pointer"
              onClick={() => deleteNoteMutation.mutate({ noteId })}
            />
          </>
        )}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Updated {formatDistanceToNow(new Date(updateAt))} ago
      </CardContent>
    </Card>
  );
};

export default NoteCard;
