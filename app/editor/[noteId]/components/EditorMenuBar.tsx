"use client";

import { useEditorStore } from "@/store/useEditroStore";

const MenuBar = () => {
  const editor = useEditorStore((s) => s.activeEditor);
  const blockId = useEditorStore((s) => s.activeBlockId);

  if (!editor) return null;

  return (
    <div className="flex gap-2 p-2 bg-gray-100 border-b sticky top-0 z-50">
      <span className="text-xs text-gray-600">Selected block: {blockId}</span>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="px-2 py-1 border rounded"
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="px-2 py-1 border rounded"
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className="px-2 py-1 border rounded"
      >
        Paragraph
      </button>
    </div>
  );
};

export default MenuBar;
