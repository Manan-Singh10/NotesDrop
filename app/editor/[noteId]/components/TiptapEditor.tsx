"use client";

import { updateContent } from "@/lib/api/blocks";
import { useEditorStore } from "@/store/useEditroStore";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { debounce } from "lodash";
import { useEffect, useMemo } from "react";

interface Props {
  blockId: string;
  content: Record<string, string>;
}

const Tiptap = ({ blockId, content }: Props) => {
  const setActiveEditor = useEditorStore((s) => s.setActiveEditor);
  const setActiveBlockId = useEditorStore((s) => s.setActiveBlockId);
  const setIsEditing = useEditorStore((s) => s.setIsEditing);

  const debouncedContentUpdate = useMemo(() => {
    return debounce((newContent: string) => {
      if (newContent === content.text) return;

      updateContent({ blockId, content: { text: newContent } }).catch((err) =>
        console.error(err)
      );
    }, 1000);
  }, [blockId, content]);

  useEffect(() => {
    return () => debouncedContentUpdate.cancel();
  }, [debouncedContentUpdate]);

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
      const newContent = editor!.getHTML();
      debouncedContentUpdate(newContent);
    },
    immediatelyRender: false,
  });

  return (
    <EditorContent className="m-0 w-full h-full outline-none" editor={editor} />
  );
};

export default Tiptap;
