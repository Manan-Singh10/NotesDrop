"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import type { DraggableData, DraggableEvent } from "react-draggable";
import type { ResizeDirection } from "re-resizable";
import Tiptap from "./TiptapEditor";
import { useEditorStore } from "@/store/useEditroStore";

interface BlockProps {
  blockId: string;
  position: { x: number; y: number; width: number; height: number };
  content: Record<string, string>;
}

const Block = ({
  blockId,
  position: { x, y, width, height },
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
    setRnd((prevRnd) => ({
      ...prevRnd,
      x: data.x,
      y: data.y,
    }));
  };

  const setSize = (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    ref: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => {
    setRnd((prevRnd) => ({
      ...prevRnd,
      width: parseFloat(ref.style.width),
      height: parseFloat(ref.style.height),
      x: position.x,
      y: position.y,
    }));
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
