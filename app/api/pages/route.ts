// api/pages/route.ts

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all unique page numbers for the note from blocks table
  const { data: blocks, error } = await supabase
    .from("blocks")
    .select("page")
    .eq("note_id", noteId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Extract unique page numbers and create page objects
  const uniquePages = Array.from(new Set(blocks?.map(block => block.page) || [1]))
    .sort((a, b) => a - b)
    .map(pageNumber => ({
      id: `page-${pageNumber}`,
      note_id: noteId,
      page_number: pageNumber,
      title: `Page ${pageNumber}`
    }));

  // If no pages exist, create a default page 1
  if (uniquePages.length === 0) {
    uniquePages.push({
      id: `page-1`,
      note_id: noteId,
      page_number: 1,
      title: `Page 1`
    });
  }

  return NextResponse.json(uniquePages);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const { noteId } = json;

  if (!noteId) {
    return NextResponse.json({ error: "noteId is required" }, { status: 400 });
  }

  // Get the current max page number for this note from blocks table
  const { data: existingBlocks, error: fetchError } = await supabase
    .from("blocks")
    .select("page")
    .eq("note_id", noteId);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const maxPageNumber = existingBlocks && existingBlocks.length > 0 
    ? Math.max(...existingBlocks.map(block => block.page || 1))
    : 0;

  const nextPageNumber = maxPageNumber + 1;

  // Create a virtual page object (since we don't have a pages table)
  const newPage = {
    id: `page-${nextPageNumber}`,
    note_id: noteId,
    page_number: nextPageNumber,
    title: `Page ${nextPageNumber}`
  };

  return NextResponse.json(newPage, { status: 201 });
}
