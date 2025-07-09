import { useEditorStore } from "@/store/useEditroStore";
import { useEffect, useState } from "react";

export function useActiveMark(mark: string) {
  const editor = useEditorStore((s) => s.activeEditor);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const update = () => setIsActive(editor.isActive(mark));
    update();

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor, mark]);

  return isActive;
}
