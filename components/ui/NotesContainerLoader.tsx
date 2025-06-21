import NoteContainerHeader from "@/app/components/NoteContainerHeader";
import React from "react";
import { Card, CardHeader, CardContent } from "./card";
import { Skeleton } from "./skeleton";

const NotesContainerLoader = () => {
  const notes = new Array(6).fill(null);

  return (
    <>
      <NoteContainerHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {notes.map((_, i) => (
          <Card
            key={i}
            className="w-full max-w-sm hover:shadow-md transition-shadow duration-200 cursor-pointer p-0 pb-3 gap-2"
          >
            <Skeleton className="w-[320px] h-[150px] object-cover rounded-t-md" />
            <CardHeader className="text-lg font-semibold truncate flex items-center gap-2">
              <div className="flex items-center w-full justify-between">
                <Skeleton className="w-30 h-6" />
                <Skeleton className="w-10 h-6" />
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <Skeleton className="w-50 h-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default NotesContainerLoader;
