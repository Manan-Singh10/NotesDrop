"use client";

import React, { useState, useRef, useEffect } from "react";
import Block from "./Block";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBlocksByNoteId, createBlock } from "@/lib/api/blocks";
import { getPagesByNoteId, createPage } from "@/lib/api/pages";
import { BlockType } from "@/lib/validators/blocks";
import { useEditorStore } from "@/store/useEditroStore";
import { useToast } from "@/contexts/ToastContext";
import { FaPlus, FaTrash } from "react-icons/fa";

const Canvas = ({ noteId }: { noteId: string }) => {
  const [zoom, setZoom] = useState(1);
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [newBlockId, setNewBlockId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [contextMenu, setContextMenu] = useState<{ pageNumber: number; x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const setActiveBlockId = useEditorStore((s) => s.setActiveBlockId);
  const { showToast } = useToast();

  // Fetch pages
  const {
    data: pages,
    isLoading: pagesLoading,
    isError: pagesError,
  } = useQuery({
    queryKey: ["pages", noteId],
    queryFn: () => getPagesByNoteId(noteId),
  });

  // Fetch blocks for current page
  const {
    data: blocks,
    isLoading: blocksLoading,
    isError: blocksError,
  } = useQuery<BlockType[]>({
    queryKey: ["blocks", noteId, currentPage],
    queryFn: () => getBlocksByNoteId(noteId, currentPage),
    enabled: !!pages && pages.length > 0,
  });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2)); // Max zoom 2x
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleCreatePage = async () => {
    try {
      const newPage = await createPage(noteId);
      queryClient.invalidateQueries({ queryKey: ["pages", noteId] });
      setCurrentPage(newPage.page_number);
      showToast(`Page ${newPage.page_number} created`, "success", 2000);
    } catch (error) {
      console.error("Failed to create page:", error);
      showToast("Failed to create page", "error", 3000);
    }
  };

  const handleDeletePage = async (pageNumber: number) => {
    try {
      // Delete all blocks on this page
      const response = await fetch(`/api/blocks?noteId=${noteId}&page=${pageNumber}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete page");
      }

      queryClient.invalidateQueries({ queryKey: ["blocks", noteId] });
      queryClient.invalidateQueries({ queryKey: ["pages", noteId] });
      
      // If we deleted the current page, switch to page 1
      if (currentPage === pageNumber) {
        setCurrentPage(1);
      }
      
      showToast(`Page ${pageNumber} deleted`, "success", 2000);
    } catch (error) {
      console.error("Failed to delete page:", error);
      showToast("Failed to delete page", "error", 3000);
    }
  };

  const handleRightClick = (e: React.MouseEvent, pageNumber: number) => {
    e.preventDefault();
    setContextMenu({
      pageNumber,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleContextMenuAction = (action: string, pageNumber: number) => {
    if (action === "delete") {
      handleDeletePage(pageNumber);
    }
    setContextMenu(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDoubleClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    // Only create a new block if the click target is the canvas itself (not a child element)
    if (event.target !== event.currentTarget) {
      return;
    }

    // Get the click position relative to the canvas
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    try {
      const newBlock = await createBlock({
        noteId,
        position: { x, y },
        size: { width: 200, height: 100 },
        page: currentPage
      });
      
      // Set the new block as active and track it for auto-selection
      setActiveBlockId(newBlock.id);
      setNewBlockId(newBlock.id);
      
      // Refetch the blocks to show the new block
      queryClient.invalidateQueries({ queryKey: ["blocks", noteId, currentPage] });
    } catch (error) {
      console.error("Failed to create block:", error);
    }
  };

  if (pagesLoading || blocksLoading) return <div>Loading...</div>;
  if (pagesError || blocksError) return <div>Error...</div>;

  // Create default page if none exist
  if (!pages || pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No pages found</p>
          <button
            onClick={handleCreatePage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Create First Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Scroll Container */}
      <div className="w-full h-full overflow-auto p-8">
        {/* Canvas with Zoom */}
        <div 
          className="w-120 h-[744px] bg-white shadow-sm rounded relative prose mx-auto"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          onDoubleClick={handleDoubleClick}
        >
          {blocks?.length === 0
            ? null
            : blocks!.map((block) => (
                <Block
                  key={block.id}
                  blockId={block.id}
                  position={block.position}
                  size={block.size}
                  content={block.content}
                  isNewBlock={block.id === newBlockId}
                  onBlockReady={() => setNewBlockId(null)}
                />
              ))}
        </div>
      </div>

      {/* Page Navigation and Zoom Controls - Bottom Right Corner */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 bg-white shadow-lg rounded-lg px-3 py-2 border">
        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          {pages.map((page: any) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.page_number)}
              onContextMenu={(e) => handleRightClick(e, page.page_number)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentPage === page.page_number
                  ? "bg-gray-100 text-gray-700 font-medium"
                  : "hover:bg-gray-50 text-gray-500"
              }`}
            >
              {page.page_number}
            </button>
          ))}
          <button
            onClick={handleCreatePage}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
            title="Add New Page"
          >
            <FaPlus size={12} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowZoomControls(!showZoomControls)}
            className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded transition-colors min-w-[60px]"
          >
            {Math.round(zoom * 100)}%
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {showZoomControls && (
          <div className="absolute bottom-12 right-0 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-1 min-w-[100px] border">
            <button
              onClick={() => { setZoom(0.5); setShowZoomControls(false); }}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded transition-colors text-left"
            >
              50%
            </button>
            <button
              onClick={() => { setZoom(0.75); setShowZoomControls(false); }}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded transition-colors text-left"
            >
              75%
            </button>
            <button
              onClick={() => { setZoom(1); setShowZoomControls(false); }}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded transition-colors text-left"
            >
              100%
            </button>
            <button
              onClick={() => { setZoom(1.25); setShowZoomControls(false); }}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded transition-colors text-left"
            >
              125%
            </button>
            <button
              onClick={() => { setZoom(1.5); setShowZoomControls(false); }}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded transition-colors text-left"
            >
              150%
            </button>
            <button
              onClick={() => { setZoom(2); setShowZoomControls(false); }}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded transition-colors text-left"
            >
              200%
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white shadow-lg rounded-lg border py-1 min-w-[120px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            onClick={() => handleContextMenuAction("delete", contextMenu.pageNumber)}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <FaTrash size={12} />
            Delete Page
          </button>
        </div>
      )}
    </div>
  );
};

export default Canvas;
