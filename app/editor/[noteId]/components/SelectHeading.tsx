import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/store/useEditroStore";
import type { Level } from "@tiptap/extension-heading";
import { useEffect, useState } from "react";

export function SelectHeading() {
  const editor = useEditorStore((s) => s.activeEditor);
  const [currentHeading, setCurrentHeading] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (!editor) return;

    const updateHeadingState = () => {
      for (let i = 1 as Level; i <= 4; i++) {
        if (editor.isActive("heading", { level: i })) {
          setCurrentHeading(i.toString());
          return;
        }
      }

      setCurrentHeading(undefined);
    };

    updateHeadingState();

    editor.on("selectionUpdate", updateHeadingState);
    editor.on("transaction", updateHeadingState);

    return () => {
      editor.off("selectionUpdate", updateHeadingState);
      editor.off("transaction", updateHeadingState);
    };
  }, [editor]);

  function handleSelect(value: string) {
    const level = Number(value) as Level;
    editor?.chain().focus().toggleHeading({ level }).run();
  }

  return (
    <Select onValueChange={handleSelect} value={currentHeading || ""}>
      <SelectTrigger className="w-[70px]">
        <SelectValue placeholder="H" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="1">H1</SelectItem>
          <SelectItem value="2">H2</SelectItem>
          <SelectItem value="3">H3</SelectItem>
          <SelectItem value="4">H4</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
