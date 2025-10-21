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
  FaTrash,
} from "react-icons/fa";
import { AiOutlineOrderedList, AiOutlineUnorderedList } from "react-icons/ai";
import { SelectHeading } from "./SelectHeading";
import { CiImageOn } from "react-icons/ci";
import { FaFilePdf } from "react-icons/fa";
import { useCallback } from "react";
import { deleteBlock } from "@/lib/api/blocks";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { downloadPageAsPDF } from "@/lib/pdf-utils";

const MenuBar = () => {
  const editor = useEditorStore((s) => s.activeEditor);
  const activeBlockId = useEditorStore((s) => s.activeBlockId);
  const setActiveBlockId = useEditorStore((s) => s.setActiveBlockId);
  const queryClient = useQueryClient();
  const params = useParams();
  const noteId = params.noteId as string;
  const { showToast } = useToast();

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

  const handleDeleteBlock = useCallback(async () => {
    if (!activeBlockId) return;

    try {
      await deleteBlock(activeBlockId);
      setActiveBlockId(null);
      queryClient.invalidateQueries({ queryKey: ["blocks", noteId] });
      showToast("Block deleted successfully", "success", 3000);
    } catch (error) {
      console.error("Failed to delete block:", error);
      showToast("Failed to delete block. Please try again.", "error", 4000);
    }
  }, [activeBlockId, setActiveBlockId, queryClient, noteId, showToast]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      // Find the canvas element (the white page area with blocks)
      const canvasElement = document.querySelector('.prose.mx-auto') as HTMLElement;
      if (!canvasElement) {
        showToast("Could not find page content to download", "error", 3000);
        return;
      }

      // Show loading toast
      showToast("Generating PDF...", "info", 2000);

      // Generate filename with note ID and current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `note-${noteId}-${currentDate}.pdf`;

      await downloadPageAsPDF(canvasElement, filename);
      showToast("PDF downloaded successfully", "success", 3000);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      showToast("Failed to download PDF. Please try again.", "error", 4000);
    }
  }, [noteId, showToast]);

  return (
    <div className="flex gap-1 sm:gap-2 md:gap-4 p-2 m-3 bg-gray-50 border-b sticky top-0 z-50 items-center rounded shadow-xs ">
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
      <FaTrash
        onClick={handleDeleteBlock}
        size={22}
        className={`${baseClass} ${!activeBlockId ? "opacity-50 cursor-not-allowed" : "hover:bg-red-200"}`}
        style={{ pointerEvents: !activeBlockId ? "none" : "auto" }}
        title={!activeBlockId ? "No block selected" : "Delete selected block"}
      />
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      <FaFilePdf
        onClick={handleDownloadPDF}
        size={22}
        className={`${baseClass} hover:bg-red-100`}
        title="Download current page as PDF"
      />
    </div>
  );
};

export default MenuBar;
