import {
  deleteNoteSchema,
  insertNoteSchema,
  updateNoteSchema,
} from "@/lib/validators/notes";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// For getting notes
export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// For inserting notes
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = insertNoteSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json({ error: "Invaild title" }, { status: 400 });

  const { title } = validation.data;

  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, user_id: user.id }])
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

// Updating titles of a note
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const validation = updateNoteSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { noteId, newTitle } = validation.data;

  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notes")
    .update({ title: newTitle })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

// for Deleting a note
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const validation = deleteNoteSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json({ error: "Invalid noteId" }, { status: 400 });

  const { noteId } = validation.data;

  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { message: "Note deleted successfully" },
    { status: 200 }
  );
}
