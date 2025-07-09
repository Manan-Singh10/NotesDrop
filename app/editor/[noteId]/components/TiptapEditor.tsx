"use client";

import { useEffect, useMemo } from "react";
import { updateContent } from "@/lib/api/blocks";
import { useEditorStore } from "@/store/useEditroStore";
import { useEditor, EditorContent } from "@tiptap/react";
import { debounce } from "lodash";

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
}

const lowlight = createLowlight(common);

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
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: false,
      }),
      Underline,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
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
