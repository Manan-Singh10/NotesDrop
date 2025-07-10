import React from "react";
import EditorMenuBar from "./components/EditorMenuBar";
import Canvas from "./components/Canvas";

interface Props {
  params: {
    noteId: string;
  };
}

const EditorPage = async ({ params }: Props) => {
  const { noteId } = await params;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-stone-100 overflow-x-scroll">
      <EditorMenuBar />
      <Canvas noteId={noteId} />
      {noteId}
    </div>
  );
};

export default EditorPage;
