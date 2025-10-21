"use client";

import { useState } from "react";
import { generateThumbnail } from "@/lib/api/thumbnails";

export default function TestThumbnailPage() {
  const [noteId, setNoteId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerateThumbnail = async () => {
    if (!noteId.trim()) {
      alert("Please enter a note ID");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await generateThumbnail(noteId);
      setResult(`Success! Thumbnail generated at: ${response.thumbnail_updated_at}`);
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Thumbnail Generation</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="noteId" className="block text-sm font-medium mb-2">
            Note ID:
          </label>
          <input
            id="noteId"
            type="text"
            value={noteId}
            onChange={(e) => setNoteId(e.target.value)}
            placeholder="Enter note ID (UUID)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleGenerateThumbnail}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate Thumbnail"}
        </button>

        {result && (
          <div className={`p-3 rounded-md ${
            result.startsWith("Success") 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {result}
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-medium mb-2">How to get a Note ID:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to your notes list</li>
          <li>Open browser developer tools (F12)</li>
          <li>Go to Network tab</li>
          <li>Refresh the page</li>
          <li>Look for the API call to <code>/api/notes</code></li>
          <li>Copy one of the note IDs from the response</li>
        </ol>
      </div>
    </div>
  );
}
