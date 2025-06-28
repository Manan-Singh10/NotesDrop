import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user)
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
