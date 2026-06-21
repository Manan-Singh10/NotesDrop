"use client";

import { useEffect, useMemo, useRef } from "react";
import { useEditorStore } from "@/store/useEditroStore";
import { usePendingChangesStore } from "@/store/usePendingChangesStore";
import { useEditor, EditorContent } from "@tiptap/react";
import { debounce } from "lodash";
import { useParams } from "next/navigation";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import { createLowlight, common } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import "highlight.js/styles/atom-one-dark.css";
import { linkConfig } from "@/lib/tiptap-extension-config";

interface Props {
  blockId: string;
  content: Record<string, string>;
  setRndHeight: (newHeight: number) => void;
  isNewBlock?: boolean;
  onBlockReady?: () => void;
}

const lowlight = createLowlight(common);

const Tiptap = ({ blockId, content, setRndHeight, isNewBlock = false, onBlockReady }: Props) => {
  const setActiveEditor = useEditorStore((s) => s.setActiveEditor);
  const setActiveBlockId = useEditorStore((s) => s.setActiveBlockId);
  const setIsEditing = useEditorStore((s) => s.setIsEditing);
  const queueChange = usePendingChangesStore((s) => s.queueChange);

  const params = useParams();
  const noteId = params.noteId as string;

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        setRndHeight(height);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [setRndHeight]);

  // Debounce so rapid keystrokes are coalesced before hitting localStorage
  const debouncedQueue = useMemo(() => {
    return debounce((newContent: string) => {
      if (newContent === content.text) return;
      queueChange(noteId, { blockId, content: { text: newContent } });
    }, 500);
  }, [blockId, noteId, content.text, queueChange]);

  useEffect(() => {
    return () => debouncedQueue.cancel();
  }, [debouncedQueue]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: false }),
      Underline,
      CodeBlockLowlight.configure({ lowlight }),
      Heading.configure({ levels: [1, 2, 3, 4] }),
      Image,
      Link.configure(linkConfig),
    ],
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
      debouncedQueue(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (isNewBlock && editor && content.text === "type or insert something here") {
      editor.commands.focus();
      editor.commands.selectAll();
      if (onBlockReady) onBlockReady();
    }
  }, [isNewBlock, editor, content.text, onBlockReady]);

  return (
    <div ref={contentRef} className="w-full px-2 py-1">
      <EditorContent
        className="m-0 w-full outline-none [&_.ProseMirror]:outline-none"
        editor={editor}
      />
    </div>
  );
};

export default Tiptap;
