import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (sessionError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get all notes for the user that don't have thumbnails
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("id, title")
      .eq("user_id", user.id)
      .is("thumbnail_url", null);

    if (notesError) {
      console.error("Error fetching notes:", notesError);
      return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }

    if (!notes || notes.length === 0) {
      return NextResponse.json({ 
        message: "All notes already have thumbnails",
        processed: 0 
      });
    }

    let processed = 0;
    let errors = 0;

    // Process each note
    for (const note of notes) {
      try {
        // Check if there are blocks on page 1
        const { data: blocks, error: blocksError } = await supabase
          .from("blocks")
          .select("*")
          .eq("note_id", note.id)
          .eq("page", 1);

        if (blocksError) {
          console.error(`Error fetching blocks for note ${note.id}:`, blocksError);
          errors++;
          continue;
        }

        if (!blocks || blocks.length === 0) {
          console.log(`No blocks found for note ${note.id}, skipping`);
          continue;
        }

        // Create thumbnail
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

        // Escape text for XML
        const escapeXml = (text: string) => text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

        const escapedTitle = escapeXml(note.title || 'Untitled Note');

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

        const thumbnailDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgThumbnail).toString('base64')}`;

        // Update the note with the thumbnail
        const { error: updateError } = await supabase
          .from("notes")
          .update({
            thumbnail_url: thumbnailDataUrl,
            thumbnail_updated_at: new Date().toISOString()
          })
          .eq("id", note.id)
          .eq("user_id", user.id);

        if (updateError) {
          console.error(`Error updating thumbnail for note ${note.id}:`, updateError);
          errors++;
        } else {
          processed++;
          console.log(`Generated thumbnail for note: ${note.title}`);
        }

      } catch (error) {
        console.error(`Error processing note ${note.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      message: `Processed ${processed} notes, ${errors} errors`,
      processed,
      errors,
      total: notes.length
    });

  } catch (error) {
    console.error("Error in batch thumbnail generation:", error);
    return NextResponse.json({ 
      error: "Failed to generate thumbnails",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
