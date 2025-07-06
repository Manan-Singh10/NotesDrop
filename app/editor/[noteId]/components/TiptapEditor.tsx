"use client";

import { updateContent } from "@/lib/api/blocks";
import { useEditorStore } from "@/store/useEditroStore";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef } from "react";

interface Props {
  blockId: string;
  content: Record<string, string>;
}

const Tiptap = ({ blockId, content }: Props) => {
  const setActiveEditor = useEditorStore((s) => s.setActiveEditor);
  const setActiveBlockId = useEditorStore((s) => s.setActiveBlockId);
  const setIsEditing = useEditorStore((s) => s.setIsEditing);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedContentUpdate = useCallback(
    (content: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        updateContent({ blockId, content: { text: content } });
        timeoutRef.current = null;
      }, 1000);
    },
    [blockId]
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: content.text,
    onFocus: () => {
      if (editor) {
        setActiveEditor(editor);
        setActiveBlockId(blockId);
        setIsEditing(true);
      }
    },
    onBlur: () => {
      setIsEditing(false);
    },
    onUpdate: () => {
      if (!editor) return;
      const content = editor!.getHTML();
      debouncedContentUpdate(content);
    },
    immediatelyRender: false,
  });

  return (
    <EditorContent className="m-0 w-full h-full outline-none" editor={editor} />
  );
};

export default Tiptap;
