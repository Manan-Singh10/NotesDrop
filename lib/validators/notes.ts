import { z } from "zod";

export type Note = {
  id: string;
  title: string;
  user_id: string;
  updated_at: string;
  created_at: string;
};

export const updateNoteSchema = z.object({
  noteId: z.string().uuid(),
  newTitle: z.string().min(1),
});

export type UpdateNotePayload = z.infer<typeof updateNoteSchema>;

export const deleteNoteSchema = z.object({
  noteId: z.string().uuid(),
});

export type DeleteNotePayload = z.infer<typeof deleteNoteSchema>;

export const insertNoteSchema = z.object({
  title: z.string().min(1),
});

export type InsertNotePayload = z.infer<typeof insertNoteSchema>;
