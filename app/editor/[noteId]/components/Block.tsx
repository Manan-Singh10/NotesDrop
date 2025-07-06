"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import type { DraggableData, DraggableEvent } from "react-draggable";
import type { ResizeDirection } from "re-resizable";
import Tiptap from "./TiptapEditor";
import { useEditorStore } from "@/store/useEditroStore";
import { updateBlock } from "@/lib/api/blocks";

interface BlockProps {
  blockId: string;
  position: { x: number; y: number };
  content: Record<string, string>;
  size: { width: number; height: number };
}

const Block = ({
  blockId,
  position: { x, y },
  size: { width, height },
  content,
}: BlockProps) => {
  const [rnd, setRnd] = useState({
    width,
    height,
    x,
    y,
  });
  const activeBlockId = useEditorStore((s) => s.activeBlockId);

  const setPosition = (e: DraggableEvent, data: DraggableData) => {
    const newPosition = {
      x: data.x,
      y: data.y,
    };

    setRnd((prev) => ({
      ...prev,
      ...newPosition,
    }));

    updateBlock({ blockId, position: newPosition }).catch((err) =>
      console.error("Failed to update position:", err)
    );
  };

  const setSize = (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    ref: HTMLElement
  ) => {
    const newSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    };

    setRnd((prev) => ({
      ...prev,
      ...newSize,
    }));

    updateBlock({ blockId, size: newSize }).catch((err) =>
      console.error("Failed to update size:", err)
    );
  };

  return (
    <Rnd
      bounds="parent"
      size={{ width: rnd.width, height: rnd.height }}
      position={{ x: rnd.x, y: rnd.y }}
      onDragStop={setPosition}
      onResizeStop={setSize}
      className={`${activeBlockId === blockId ? "border-1" : ""}`}
    >
      <Tiptap blockId={blockId} content={content} />
    </Rnd>
  );
};

export default Block;
