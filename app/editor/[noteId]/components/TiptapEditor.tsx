"use client";

import { useEditorStore } from "@/store/useEditroStore";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface Props {
  blockId: string;
}

const Tiptap = ({ blockId }: Props) => {
  const setActiveEditor = useEditorStore((s) => s.setActiveEditor);
  const setActiveBlockId = useEditorStore((s) => s.setActiveBlockId);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
    onFocus: () => {
      if (editor) {
        setActiveEditor(editor);
        setActiveBlockId(blockId);
      }
    },
  });

  return (
    <EditorContent className="m-0 w-full h-full outline-none" editor={editor} />
  );
};

export default Tiptap;
