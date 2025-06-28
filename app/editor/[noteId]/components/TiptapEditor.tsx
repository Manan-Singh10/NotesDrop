"use client";

import { useEditorStore } from "@/store/useEditroStore";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface Props {
  blockId: string;
  content: Record<string, string>;
}

const Tiptap = ({ blockId, content }: Props) => {
  const setActiveEditor = useEditorStore((s) => s.setActiveEditor);
  const setActiveBlockId = useEditorStore((s) => s.setActiveBlockId);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content.text,
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
