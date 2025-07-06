// api/blocks/route.ts

import { PatchBlockSchema } from "@/lib/validators/blocks";
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

  const { data: blocks, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("note_id", noteId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log(blocks);
  return NextResponse.json(blocks);
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
