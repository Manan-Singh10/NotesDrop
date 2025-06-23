import { Editor } from "@tiptap/react";
import { create } from "zustand";

interface EditorStore {
  activeEditor: Editor | null;
  setActiveEditor: (editor: Editor | null) => void;
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  activeEditor: null,
  setActiveEditor(editor) {
    set({ activeEditor: editor });
  },
  activeBlockId: null,
  setActiveBlockId(id) {
    set({ activeBlockId: id });
  },
}));
