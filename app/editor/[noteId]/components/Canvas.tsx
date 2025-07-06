"use client";

import React from "react";
import Block from "./Block";
import { useQuery } from "@tanstack/react-query";
import { getBlocksByNoteId } from "@/lib/api/blocks";
import { BlockType } from "@/lib/validators/blocks";

const Canvas = ({ noteId }: { noteId: string }) => {
  const {
    data: blocks,
    isLoading,
    isError,
  } = useQuery<BlockType[]>({
    queryKey: ["blocks", noteId],
    queryFn: () => getBlocksByNoteId(noteId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error...</div>;

  return (
    <div className="aspect-[10/16] bg-white min-w-80 sm:min-w-120 md:min-w-180 lg:min-w-200 shadow-sm rounded relative prose">
      {blocks?.length === 0
        ? null
        : blocks!.map((block) => (
            <Block
              key={block.id}
              blockId={block.id}
              position={block.position}
              size={block.size}
              content={block.content}
            />
          ))}
    </div>
  );
};

export default Canvas;
