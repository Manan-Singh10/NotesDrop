import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;

  try {
    // Verify the note belongs to the user
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, user_id")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (noteError || !note) {
      console.error("Note not found:", noteError);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Check if there are blocks on page 1
    const { data: blocks, error: blocksError } = await supabase
      .from("blocks")
      .select("*")
      .eq("note_id", noteId)
      .eq("page", 1);

    if (blocksError) {
      console.error("Error fetching blocks:", blocksError);
      return NextResponse.json({ error: "Failed to fetch blocks" }, { status: 500 });
    }

    if (!blocks || blocks.length === 0) {
      return NextResponse.json({ 
        error: "No content found on page 1 to generate thumbnail" 
      }, { status: 400 });
    }

    // Create a simple placeholder thumbnail based on content
    const hasText = blocks.some(block => 
      block.content && 
      (typeof block.content === 'string' || 
       (typeof block.content === 'object' && block.content.text))
    );

    const hasImages = blocks.some(block => 
      block.content && 
      typeof block.content === 'object' && 
      block.content.text && 
      block.content.text.includes('<img')
    );

    // Generate a simple SVG thumbnail
    const svgThumbnail = `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="200" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
        <text x="200" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#495057">
          ${note.title || 'Untitled Note'}
        </text>
        <text x="200" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">
          ${blocks.length} block${blocks.length !== 1 ? 's' : ''} • Page 1
        </text>
        <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#adb5bd">
          ${hasText ? '📝 Text' : ''} ${hasImages ? '🖼️ Images' : ''}
        </text>
      </svg>
    `;

    const dataUrl = `data:image/svg+xml;base64,${btoa(svgThumbnail)}`;

    // Update the note with the new thumbnail
    const { data: updatedNote, error: updateError } = await supabase
      .from("notes")
      .update({
        thumbnail_url: dataUrl,
        thumbnail_updated_at: new Date().toISOString()
      })
      .eq("id", noteId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating thumbnail:", updateError);
      return NextResponse.json({ error: "Failed to update thumbnail" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      thumbnail_url: dataUrl,
      thumbnail_updated_at: updatedNote.thumbnail_updated_at,
      blocks_count: blocks.length
    });

  } catch (error) {
    console.error("Error generating simple thumbnail:", error);
    return NextResponse.json({ 
      error: "Failed to generate thumbnail",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
