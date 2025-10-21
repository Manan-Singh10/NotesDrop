import domtoimage from 'dom-to-image';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpeg';
}

export const generateNoteThumbnail = async (
  element: HTMLElement, 
  options: ThumbnailOptions = {}
): Promise<string> => {
  const {
    width = 400,
    height = 200,
    quality = 0.8,
    format = 'png'
  } = options;

  try {
    // Validate element
    if (!element || !element.offsetWidth || !element.offsetHeight) {
      throw new Error('Invalid element provided for thumbnail generation');
    }

    // Create a clone of the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Create a temporary container with explicit styling
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = element.offsetWidth + 'px';
    tempContainer.style.height = element.offsetHeight + 'px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.overflow = 'hidden';
    tempContainer.appendChild(clonedElement);
    
    // Add to DOM temporarily
    document.body.appendChild(tempContainer);

    // Wait for any images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ensure all images are loaded before generating thumbnail
    const images = clonedElement.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(true);
        } else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true); // Continue even if image fails to load
        }
      });
    });
    
    await Promise.all(imagePromises);

    // Generate thumbnail with specified dimensions
    const dataUrl = await domtoimage.toPng(clonedElement, {
      quality: quality,
      bgcolor: '#ffffff',
      width: width * 2, // 2x scaling for better quality
      height: height * 2,
      style: {
        transform: 'scale(2)',
        transformOrigin: 'top left',
        width: width + 'px',
        height: height + 'px',
      },
      filter: (node: any) => {
        // Skip script tags and other non-essential elements
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT') {
            return false;
          }
        }
        return true;
      }
    });

    // Clean up temporary container
    document.body.removeChild(tempContainer);

    return dataUrl;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

export const generateThumbnailFromPage = async (
  noteId: string,
  pageNumber: number = 1,
  options: ThumbnailOptions = {}
): Promise<string> => {
  // Check if we're running in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Thumbnail generation must run in browser environment');
  }

  try {
    console.log(`Starting thumbnail generation for note ${noteId}, page ${pageNumber}`);
    
    // Import the API functions dynamically to avoid circular dependencies
    const { getBlocksByNoteId } = await import('@/lib/api/blocks');

    // Get blocks for the first page
    const blocks = await getBlocksByNoteId(noteId, pageNumber);
    
    console.log(`Found ${blocks?.length || 0} blocks for note ${noteId}`);
    
    if (!blocks || blocks.length === 0) {
      throw new Error('No content found to generate thumbnail');
    }

    // Create a temporary page element
    const pageElement = document.createElement('div');
    pageElement.className = 'w-120 h-[744px] bg-white shadow-sm rounded relative prose mx-auto';
    pageElement.style.width = '480px'; // w-120 = 480px
    pageElement.style.height = '744px';
    pageElement.style.backgroundColor = '#ffffff';
    pageElement.style.position = 'relative';
    pageElement.style.overflow = 'hidden';

    // Add blocks to the page element
    blocks.forEach((block: any) => {
      const blockElement = document.createElement('div');
      blockElement.style.position = 'absolute';
      blockElement.style.left = `${block.position.x}px`;
      blockElement.style.top = `${block.position.y}px`;
      blockElement.style.width = `${block.size.width}px`;
      blockElement.style.height = `${block.size.height}px`;
      blockElement.style.border = '1px solid #e5e7eb';
      blockElement.style.borderRadius = '4px';
      blockElement.style.padding = '8px';
      blockElement.style.backgroundColor = '#ffffff';
      blockElement.style.overflow = 'hidden';
      blockElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      blockElement.style.fontSize = '14px';
      blockElement.style.lineHeight = '1.5';
      
      // Add content to the block - handle both object and string content
      if (block.content) {
        if (typeof block.content === 'string') {
          blockElement.innerHTML = block.content;
        } else if (block.content.text) {
          // TipTap content is stored as content.text
          blockElement.innerHTML = block.content.text;
        } else if (typeof block.content === 'object') {
          // Fallback for other object structures
          blockElement.textContent = JSON.stringify(block.content);
        }
      }
      
      pageElement.appendChild(blockElement);
    });

    // Add TipTap CSS styles to ensure proper rendering
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .prose {
        color: #000000;
        max-width: none;
      }
      .prose p {
        margin: 0 0 8px 0;
      }
      .prose h1, .prose h2, .prose h3, .prose h4 {
        margin: 0 0 8px 0;
        font-weight: bold;
      }
      .prose h1 { font-size: 24px; }
      .prose h2 { font-size: 20px; }
      .prose h3 { font-size: 18px; }
      .prose h4 { font-size: 16px; }
      .prose ul, .prose ol {
        margin: 0 0 8px 0;
        padding-left: 20px;
      }
      .prose li {
        margin: 0 0 4px 0;
      }
      .prose blockquote {
        margin: 0 0 8px 0;
        padding-left: 16px;
        border-left: 4px solid #e5e7eb;
        font-style: italic;
      }
      .prose code {
        background-color: #f3f4f6;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
      }
      .prose pre {
        background-color: #f3f4f6;
        padding: 8px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 0 0 8px 0;
      }
      .prose img {
        max-width: 100%;
        height: auto;
      }
      .prose a {
        color: #2563eb;
        text-decoration: underline;
      }
    `;
    document.head.appendChild(styleElement);

    // Generate thumbnail
    const thumbnail = await generateNoteThumbnail(pageElement, options);

    // Clean up
    document.head.removeChild(styleElement);

    return thumbnail;
  } catch (error) {
    console.error('Error generating thumbnail from page:', error);
    throw new Error('Failed to generate thumbnail from page');
  }
};
