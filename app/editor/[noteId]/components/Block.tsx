"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import type { DraggableData, DraggableEvent } from "react-draggable";
import type { ResizeDirection } from "re-resizable";
import Tiptap from "./TiptapEditor";
import { useEditorStore } from "@/store/useEditroStore";
import { updateBlock } from "@/lib/api/blocks";
import debounce from "lodash.debounce";

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
  const isEditing = useEditorStore((s) => s.isEditing);

  const debouncedUpdateBlock = useMemo(() => {
    return debounce(
      (
        blockId: string,
        newPosition?: { x: number; y: number },
        newSize?: { width: number; height: number }
      ) => {
        if (
          (newPosition?.x === x && newPosition?.y === y) ||
          (newSize?.width === width && newSize?.height === height)
        )
          return;

        const payload: {
          blockId: string;
          position?: { x: number; y: number };
          size?: { width: number; height: number };
        } = { blockId };

        if (newPosition) payload.position = newPosition;
        if (newSize) payload.size = newSize;

        updateBlock(payload).catch((err) =>
          console.error(
            `Failed to update ${newPosition ? "position" : "size"}:`,
            err
          )
        );
      },
      2000
    );
  }, [x, y, width, height]);

  useEffect(() => {
    return () => {
      debouncedUpdateBlock.cancel();
    };
  }, [debouncedUpdateBlock]);

  const setPosition = (e: DraggableEvent, data: DraggableData) => {
    const newPosition = {
      x: data.x,
      y: data.y,
    };

    setRnd((prev) => ({
      ...prev,
      ...newPosition,
    }));

    debouncedUpdateBlock(blockId, newPosition);
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

    debouncedUpdateBlock(blockId, undefined, newSize);
  };

  return (
    <Rnd
      disableDragging={isEditing}
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
