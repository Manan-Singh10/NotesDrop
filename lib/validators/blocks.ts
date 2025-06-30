// types/block.ts
import { z } from "zod";

export const PatchBlockSchema = z.object({
  blockId: z.string().uuid(), // required
  content: z.record(z.any()).optional(), // JSONB
  position: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  page: z.number().int().min(1).optional(),
});

export type UpdateBlockPayload = {
  blockId: string;
  position?: { x: number; y: number; width?: number; height?: number };
  content?: Record<string, unknown>;
  page?: number;
};

export interface BlockType {
  id: string;
  note_id: string;
  type: string;
  content: Record<string, string>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  page: number;
  created_at: string;
  updated_at: string;
}
