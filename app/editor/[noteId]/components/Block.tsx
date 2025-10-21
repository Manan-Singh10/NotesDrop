"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  isNewBlock?: boolean;
  onBlockReady?: () => void;
}

const Block = ({
  blockId,
  position: { x, y },
  size: { width, height },
  content,
  isNewBlock = false,
  onBlockReady,
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

  const setPosition = useCallback(
    (e: DraggableEvent, data: DraggableData) => {
      const newPosition = {
        x: data.x,
        y: data.y,
      };

      setRnd((prev) => ({
        ...prev,
        ...newPosition,
      }));

      debouncedUpdateBlock(blockId, newPosition);
    },
    [blockId, debouncedUpdateBlock]
  );

  const setSize = useCallback(
    (
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
    },
    [blockId, debouncedUpdateBlock]
  );

  const setRndHeight = useCallback((newHeight: number) => {
    setRnd((prev) => ({ ...prev, height: newHeight }));
  }, []);

  console.log(2);

  return (
    <Rnd
      disableDragging={isEditing}
      bounds="parent"
      size={{ width: rnd.width, height: rnd.height }}
      position={{ x: rnd.x, y: rnd.y }}
      onDragStop={setPosition}
      onResizeStop={setSize}
      onDoubleClick={(e: React.MouseEvent) => e.stopPropagation()}
      className={`${
        activeBlockId === blockId ? "border-1" : ""
      }  flex items-center justify-center`}
    >
      <Tiptap 
        blockId={blockId} 
        content={content} 
        setRndHeight={setRndHeight}
        isNewBlock={isNewBlock}
        onBlockReady={onBlockReady}
      />
    </Rnd>
  );
};

export default Block;
