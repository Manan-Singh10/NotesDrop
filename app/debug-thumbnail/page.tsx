"use client";

import { useState, useEffect } from "react";

export default function DebugThumbnailPage() {
  const [notes, setNotes] = useState<Array<{ id: string; title: string; thumbnail_url?: string; thumbnail_updated_at?: string }>>([]);
  const [blocks, setBlocks] = useState<Array<{ id: string; type: string; content: unknown; position?: { x: number; y: number }; size?: { width: number; height: number } }>>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data);
      console.log('Notes:', data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (noteId: string) => {
    if (!noteId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/blocks?noteId=${noteId}&page=1`);
      const data = await response.json();
      setBlocks(data);
      console.log('Blocks for note:', noteId, data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const testThumbnailGeneration = async (noteId: string) => {
    try {
      console.log(`Testing thumbnail generation for note: ${noteId}`);
      const response = await fetch(`/api/notes/${noteId}/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('Thumbnail generation result:', result);
      
      if (response.ok) {
        alert('Thumbnail generated successfully!');
        fetchNotes(); // Refresh notes to see the thumbnail
      } else {
        alert(`Error: ${result.details || result.error}`);
      }
    } catch (error) {
      console.error('Error testing thumbnail generation:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testSimpleThumbnailGeneration = async (noteId: string) => {
    try {
      console.log(`Testing simple thumbnail generation for note: ${noteId}`);
      const response = await fetch(`/api/notes/${noteId}/thumbnail-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('Simple thumbnail generation result:', result);
      
      if (response.ok) {
        alert('Simple thumbnail generated successfully!');
        fetchNotes(); // Refresh notes to see the thumbnail
      } else {
        alert(`Error: ${result.details || result.error}`);
      }
    } catch (error) {
      console.error('Error testing simple thumbnail generation:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateAllThumbnails = async () => {
    if (!confirm('This will generate thumbnails for all notes that don\'t have them. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      console.log('Generating thumbnails for all notes...');
      const response = await fetch('/api/notes/generate-all-thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('Batch thumbnail generation result:', result);
      
      if (response.ok) {
        alert(`Success! ${result.message}`);
        fetchNotes(); // Refresh notes to see the thumbnails
      } else {
        alert(`Error: ${result.details || result.error}`);
      }
    } catch (error) {
      console.error('Error generating all thumbnails:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Thumbnail Generation</h1>
      
      <div className="space-y-6">
        {/* Notes Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <div className="flex gap-2 mb-4">
            <button 
              onClick={fetchNotes}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Notes'}
            </button>
            <button 
              onClick={generateAllThumbnails}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate All Thumbnails'}
            </button>
          </div>
          
          <div className="grid gap-4">
            {notes.map((note) => (
              <div key={note.id} className="border p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{note.title}</h3>
                    <p className="text-sm text-gray-600">ID: {note.id}</p>
                    <p className="text-sm text-gray-600">
                      Thumbnail: {note.thumbnail_url ? '✅ Generated' : '❌ Not generated'}
                    </p>
                    {note.thumbnail_updated_at && (
                      <p className="text-sm text-gray-600">
                        Updated: {new Date(note.thumbnail_updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedNoteId(note.id);
                        fetchBlocks(note.id);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Check Blocks
                    </button>
                    <button
                      onClick={() => testThumbnailGeneration(note.id)}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      Generate Thumbnail
                    </button>
                    <button
                      onClick={() => testSimpleThumbnailGeneration(note.id)}
                      className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                    >
                      Simple Thumbnail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blocks Section */}
        {selectedNoteId && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Blocks for Note: {selectedNoteId}
            </h2>
            <div className="border p-4 rounded">
              {blocks.length === 0 ? (
                <p className="text-gray-600">No blocks found on page 1</p>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="bg-gray-100 p-2 rounded text-sm">
                      <p><strong>Block {index + 1}:</strong></p>
                      <p>Type: {block.type}</p>
                      <p>Content: {JSON.stringify(block.content).substring(0, 100)}...</p>
                      <p>Position: x={block.position?.x}, y={block.position?.y}</p>
                      <p>Size: {block.size?.width}x{block.size?.height}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
