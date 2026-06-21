"use client";

import React, { useCallback, useState } from "react";
import { Rnd } from "react-rnd";
import type { DraggableData, DraggableEvent } from "react-draggable";
import type { ResizeDirection } from "re-resizable";
import Tiptap from "./TiptapEditor";
import { useEditorStore } from "@/store/useEditroStore";
import { usePendingChangesStore } from "@/store/usePendingChangesStore";
import { useParams } from "next/navigation";

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
  const [rnd, setRnd] = useState({ width, height, x, y });

  const activeBlockId = useEditorStore((s) => s.activeBlockId);
  const isEditing = useEditorStore((s) => s.isEditing);
  const queueChange = usePendingChangesStore((s) => s.queueChange);
  const params = useParams();
  const noteId = params.noteId as string;

  const setPosition = useCallback(
    (e: DraggableEvent, data: DraggableData) => {
      const newPosition = { x: data.x, y: data.y };
      setRnd((prev) => ({ ...prev, ...newPosition }));
      queueChange(noteId, { blockId, position: newPosition });
    },
    [blockId, noteId, queueChange]
  );

  const setSize = useCallback(
    (
      e: MouseEvent | TouchEvent,
      direction: ResizeDirection,
      ref: HTMLElement
    ) => {
      const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
      setRnd((prev) => ({ ...prev, ...newSize }));
      queueChange(noteId, { blockId, size: newSize });
    },
    [blockId, noteId, queueChange]
  );

  const setRndHeight = useCallback((newHeight: number) => {
    setRnd((prev) => ({ ...prev, height: newHeight }));
  }, []);

  const isActive = activeBlockId === blockId;

  return (
    <Rnd
      disableDragging={isEditing}
      bounds="parent"
      size={{ width: rnd.width, height: rnd.height }}
      position={{ x: rnd.x, y: rnd.y }}
      onDragStop={setPosition}
      onResizeStop={setSize}
      onDoubleClick={(e: React.MouseEvent) => e.stopPropagation()}
      enableResizing={isActive}
      className={`${isActive ? "ring-2 ring-blue-400" : ""} w-full`}
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
