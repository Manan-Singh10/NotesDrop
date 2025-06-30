"use client";

import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import type { DraggableData, DraggableEvent } from "react-draggable";
import type { ResizeDirection } from "re-resizable";
import Tiptap from "./TiptapEditor";
import { useEditorStore } from "@/store/useEditroStore";
import { useMutation } from "@tanstack/react-query";
import { updateBlock } from "@/lib/api/blocks";

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
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  const mutation = useMutation({ mutationFn: updateBlock });
  const activeBlockId = useEditorStore((s) => s.activeBlockId);

  const scheduleSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      console.log("Saving block", rnd);
      mutation.mutate({
        blockId,
        position: {
          x: rnd.x,
          y: rnd.y,
          width: rnd.width ?? 200,
          height: rnd.height ?? 100,
        },
      });
      setIsDirty(false);
    }, 500);
  };

  const setPosition = (e: DraggableEvent, data: DraggableData) => {
    setRnd((prevRnd) => ({
      ...prevRnd,
      x: data.x,
      y: data.y,
    }));
    setIsDirty(true);
    scheduleSave();
  };

  const setSize = (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    ref: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => {
    const newState = {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    };

    setRnd((prevRnd) => ({
      ...prevRnd,
      ...newState,
    }));

    setIsDirty(true);
    scheduleSave();
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
      {isDirty ||
        (mutation.isPending && (
          <div className="text-xs text-gray-500">saving...</div>
        ))}
    </Rnd>
  );
};

export default Block;
