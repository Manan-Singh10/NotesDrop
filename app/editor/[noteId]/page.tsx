import React from "react";

interface Props {
  params: {
    noteId: string;
  };
}

const EditorPage = async ({ params }: Props) => {
  const { noteId } = await params;

  return <div>EditorPage - {noteId} </div>;
};

export default EditorPage;
