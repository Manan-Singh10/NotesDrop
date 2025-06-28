// types/block.ts
export interface BlockType {
  id: string;
  note_id: string;
  type: string;
  content: Record<string, string>; // or more specific if you know structure
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
