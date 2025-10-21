// api/blocks/route.ts

import { PatchBlockSchema } from "@/lib/validators/blocks";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");
  const pageNumber = searchParams.get("page");

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let query = supabase
    .from("blocks")
    .select("*")
    .eq("note_id", noteId);

  if (pageNumber) {
    query = query.eq("page", parseInt(pageNumber));
  }

  const { data: blocks, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log(blocks);
  return NextResponse.json(blocks);
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
  const { noteId, position, size, page } = json;

  if (!noteId) {
    return NextResponse.json({ error: "noteId is required" }, { status: 400 });
  }

  const { data: block, error } = await supabase
    .from("blocks")
    .insert({
      note_id: noteId,
      type: "text",
      content: { text: "type or insert something here" },
      position: position || { x: 100, y: 100 },
      size: size || { width: 200, height: 100 },
      page: page || 1,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(block, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const json = await request.json();
  console.log("Received PATCH request with data:", json);
  const validation = PatchBlockSchema.safeParse(json);

  if (!validation.success)
    return NextResponse.json(
      { error: "Invalid request", issues: validation.error.errors },
      { status: 400 }
    );

  const { position, blockId, content, page, size } = validation.data;

  const { data, error } = await supabase
    .from("blocks")
    .update({
      ...(position && { position }),
      ...(size && { size }),
      ...(content && { content }),
      ...(page !== undefined && { page }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", blockId)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const blockId = searchParams.get("blockId");
  const noteId = searchParams.get("noteId");
  const pageNumber = searchParams.get("page");

  // Delete all blocks on a specific page
  if (noteId && pageNumber) {
    const { error } = await supabase
      .from("blocks")
      .delete()
      .eq("note_id", noteId)
      .eq("page", parseInt(pageNumber));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Delete a specific block
  if (!blockId) {
    return NextResponse.json({ error: "blockId is required for single block deletion" }, { status: 400 });
  }

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("id", blockId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
