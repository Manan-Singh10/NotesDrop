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
  const body = await request.json().catch(() => ({}));
  const { thumbnailDataUrl } = body;

  try {
    // Verify the note belongs to the user and get the title
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, user_id, title")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (noteError || !note) {
      console.error("Note not found:", noteError);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    let finalThumbnailDataUrl = thumbnailDataUrl;

    // If no thumbnail data URL provided, generate a simple server-side thumbnail
    if (!finalThumbnailDataUrl) {
      console.log(`Generating simple thumbnail server-side for note: ${noteId}`);
      
      // Check if there are blocks on page 1
      const { data: blocks, error: blocksError } = await supabase
        .from("blocks")
        .select("*")
        .eq("note_id", noteId)
        .eq("page", 1);

      if (blocksError) {
        console.error("Error fetching blocks:", blocksError);
        throw new Error("Failed to fetch blocks");
      }

      if (!blocks || blocks.length === 0) {
        throw new Error("No content found on page 1 to generate thumbnail");
      }

      // Extract content preview from blocks
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

      // Get first text content for preview
      let contentPreview = '';
      for (const block of blocks) {
        if (block.content) {
          let text = '';
          if (typeof block.content === 'string') {
            text = block.content;
          } else if (typeof block.content === 'object' && block.content.text) {
            // Strip HTML tags for preview
            text = block.content.text.replace(/<[^>]*>/g, '');
          }
          
          if (text.trim()) {
            contentPreview = text.trim().substring(0, 50);
            if (text.trim().length > 50) contentPreview += '...';
            break;
          }
        }
      }

      // Escape text for XML
      const escapeXml = (text: string) => text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

      const escapedTitle = escapeXml(note.title || 'Untitled Note');
      const escapedPreview = escapeXml(contentPreview);

      // Create a more realistic note editor thumbnail
      const svgThumbnail = `
        <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
          <!-- Background -->
          <rect width="400" height="200" fill="#f5f5f4"/>
          
          <!-- Note page background -->
          <rect x="20" y="20" width="360" height="160" fill="#ffffff" stroke="#e5e7eb" stroke-width="1" rx="8"/>
          
          <!-- Page shadow -->
          <rect x="22" y="22" width="356" height="156" fill="none" stroke="#d1d5db" stroke-width="1" rx="8"/>
          
          <!-- Content blocks simulation -->
          ${blocks.slice(0, 4).map((block, index) => {
            const y = 40 + (index * 25);
            const blockWidth = Math.min(320, 200 + (index * 20));
            const blockHeight = 20;
            
            // Simulate different block types
            if (block.content && typeof block.content === 'object' && block.content.text) {
              const text = block.content.text.replace(/<[^>]*>/g, '').substring(0, 30);
              if (text.trim()) {
                return `
                  <rect x="40" y="${y}" width="${blockWidth}" height="${blockHeight}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="4"/>
                  <text x="45" y="${y + 14}" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
                    ${escapeXml(text.trim())}
                  </text>
                `;
              }
            }
            
            // Default block
            return `
              <rect x="40" y="${y}" width="${blockWidth}" height="${blockHeight}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="4"/>
              <text x="45" y="${y + 14}" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">
                type or insert something here
              </text>
            `;
          }).join('')}
          
          <!-- Page indicator -->
          <text x="40" y="170" font-family="system-ui, sans-serif" font-size="9" fill="#64748b">
            Page 1 • ${blocks.length} block${blocks.length !== 1 ? 's' : ''}
          </text>
          
          <!-- Note title in header -->
          <text x="200" y="35" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#1e293b">
            ${escapedTitle}
          </text>
        </svg>
      `;

      finalThumbnailDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgThumbnail).toString('base64')}`;
      console.log(`Simple thumbnail generated successfully for note: ${noteId}`);
    } else {
      console.log(`Using client-generated thumbnail for note: ${noteId}`);
    }

    // Update the note with the new thumbnail
    const { data: updatedNote, error: updateError } = await supabase
      .from("notes")
      .update({
        thumbnail_url: finalThumbnailDataUrl,
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
      thumbnail_url: finalThumbnailDataUrl,
      thumbnail_updated_at: updatedNote.thumbnail_updated_at
    });

  } catch (error) {
    console.error("Error generating thumbnail:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      noteId
    });
    return NextResponse.json({ 
      error: "Failed to generate thumbnail",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(
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
    // Get the note with thumbnail information
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, thumbnail_url, thumbnail_updated_at")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({
      thumbnail_url: note.thumbnail_url,
      thumbnail_updated_at: note.thumbnail_updated_at
    });

  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    return NextResponse.json({ 
      error: "Failed to fetch thumbnail" 
    }, { status: 500 });
  }
}
