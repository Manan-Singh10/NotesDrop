"use client";

import { useActiveMark } from "@/hooks/useActiveMark";
import { useEditorStore } from "@/store/useEditroStore";
import {
  FaBold,
  FaCode,
  FaItalic,
  FaLink,
  FaParagraph,
  FaQuoteLeft,
  FaStrikethrough,
  FaUnderline,
} from "react-icons/fa";
import { AiOutlineOrderedList, AiOutlineUnorderedList } from "react-icons/ai";
import { SelectHeading } from "./SelectHeading";
import { CiImageOn } from "react-icons/ci";
import { useCallback } from "react";

const MenuBar = () => {
  const editor = useEditorStore((s) => s.activeEditor);

  const boldActive = useActiveMark("bold");
  const italicActive = useActiveMark("italic");
  const strikeActive = useActiveMark("strike");
  const blockquoteActive = useActiveMark("blockquote");
  const underlineActive = useActiveMark("underline");
  const codeBlockActive = useActiveMark("codeBlock");
  const bulletListActive = useActiveMark("bulletList");
  const orderedListActive = useActiveMark("orderedList");
  const linkActive = useActiveMark("link");

  const baseClass = "cursor-pointer p-1 rounded hover:bg-gray-200";
  const activeClass = "bg-blue-400 text-white";

  const addImage = useCallback(() => {
    const url = window.prompt("URL");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    try {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  }, [editor]);

  return (
    <div className="flex gap-4 p-2 m-3 bg-gray-50 border-b sticky top-0 z-50 items-center rounded shadow-xs ">
      <FaBold
        onClick={() => editor?.chain().focus().toggleBold().run()}
        size={22}
        className={`${baseClass} ${boldActive ? activeClass : ""}`}
      />
      <FaItalic
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        size={22}
        className={`${baseClass} ${italicActive ? activeClass : ""}`}
      />
      <FaParagraph
        onClick={() => editor?.chain().focus().setParagraph().run()}
        size={22}
        className={baseClass}
      />
      <FaQuoteLeft
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        size={22}
        className={`${baseClass} ${blockquoteActive ? activeClass : ""}`}
      />
      <FaStrikethrough
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        size={22}
        className={`${baseClass} ${strikeActive ? activeClass : ""}`}
      />
      <FaUnderline
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        size={22}
        className={`${baseClass} ${underlineActive ? activeClass : ""}`}
      />
      <FaCode
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        size={22}
        className={`${baseClass} ${codeBlockActive ? activeClass : ""}`}
      />
      <SelectHeading />
      <AiOutlineUnorderedList
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        size={24}
        className={`${baseClass} ${bulletListActive ? activeClass : ""}`}
      />
      <AiOutlineOrderedList
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        size={24}
        className={`${baseClass} ${orderedListActive ? activeClass : ""}`}
      />
      <CiImageOn
        onClick={addImage}
        size={26}
        className={`${baseClass} ${orderedListActive ? activeClass : ""}`}
      />
      <FaLink
        onClick={setLink}
        size={22}
        className={`${baseClass} ${linkActive ? activeClass : ""}`}
      />
    </div>
  );
};

export default MenuBar;
