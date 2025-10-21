import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

export const downloadPageAsPDF = async (element: HTMLElement, filename: string = 'note-page.pdf') => {
  try {
    // Validate element
    if (!element || !element.offsetWidth || !element.offsetHeight) {
      throw new Error('Invalid element provided for PDF generation');
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
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Ensure all images are loaded before generating PDF
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

    // Generate high-quality PNG with maximum resolution
    const dataUrl = await domtoimage.toPng(clonedElement, {
      quality: 1.0, // Maximum quality
      bgcolor: '#ffffff',
      width: element.offsetWidth * 4, // 4x the width for ultra-high resolution
      height: element.offsetHeight * 4, // 4x the height for ultra-high resolution
      style: {
        transform: 'scale(4)', // Scale up for maximum quality
        transformOrigin: 'top left',
        width: element.offsetWidth + 'px',
        height: element.offsetHeight + 'px',
      },
      filter: (node: Node) => {
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

    // Create PDF with better page sizing
    const pdf = new jsPDF({
      orientation: element.offsetWidth > element.offsetHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Calculate dimensions to fit the page with some margin
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // 15mm margin for better appearance
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);
    
    // Get image dimensions from the data URL
    const img = new Image();
    img.src = dataUrl;
    
    // Wait for image to load to get dimensions
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    // Calculate the original dimensions (divide by 4 since we used 4x scaling)
    const originalWidth = img.width / 4;
    const originalHeight = img.height / 4;
    
    // Calculate scaling ratio to fit the page while maintaining aspect ratio
    const widthRatio = availableWidth / originalWidth;
    const heightRatio = availableHeight / originalHeight;
    const scale = Math.min(widthRatio, heightRatio);
    
    // Calculate final dimensions
    const finalWidth = originalWidth * scale;
    const finalHeight = originalHeight * scale;
    
    // Center the image on the page
    const imgX = (pdfWidth - finalWidth) / 2;
    const imgY = (pdfHeight - finalHeight) / 2;

    // Add high-quality image to PDF
    pdf.addImage(dataUrl, 'PNG', imgX, imgY, finalWidth, finalHeight, undefined, 'FAST');

    // Download the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const downloadAllPagesAsPDF = async (noteId: string, filename: string = 'note-all-pages.pdf') => {
  try {
    // Import the API functions dynamically to avoid circular dependencies
    const { getPagesByNoteId } = await import('@/lib/api/pages');
    const { getBlocksByNoteId } = await import('@/lib/api/blocks');

    // Get all pages for this note
    const pages = await getPagesByNoteId(noteId);
    
    if (!pages || pages.length === 0) {
      throw new Error('No pages found to download');
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);

    let isFirstPage = true;

    // Process each page
    for (const page of pages) {
      try {
        // Get blocks for this page
        const blocks = await getBlocksByNoteId(noteId, page.page_number);
        
        // Create a temporary page element
        const pageElement = document.createElement('div');
        pageElement.className = 'w-120 h-[744px] bg-white shadow-sm rounded relative prose mx-auto';
        pageElement.style.width = '480px'; // w-120 = 480px
        pageElement.style.height = '744px';
        pageElement.style.backgroundColor = '#ffffff';
        pageElement.style.position = 'relative';
        pageElement.style.overflow = 'hidden';

        // Add blocks to the page element
        if (blocks && blocks.length > 0) {
          blocks.forEach((block: { position: { x: number; y: number }; size: { width: number; height: number }; content: string | { text: string } | Record<string, unknown> }) => {
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
              } else if (typeof block.content === 'object' && 'text' in block.content) {
                // TipTap content is stored as content.text
                blockElement.innerHTML = (block.content as { text: string }).text;
              } else if (typeof block.content === 'object') {
                // Fallback for other object structures
                blockElement.textContent = JSON.stringify(block.content);
              }
            }
            
            pageElement.appendChild(blockElement);
          });
        }

        // Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '480px';
        tempContainer.style.height = '744px';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.style.overflow = 'hidden';
        
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
        
        tempContainer.appendChild(pageElement);
        document.body.appendChild(tempContainer);

        // Wait for any images to load
        await new Promise(resolve => setTimeout(resolve, 300));

        const images = pageElement.querySelectorAll('img');
        const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            }
          });
        });
        
        await Promise.all(imagePromises);

        // Generate high-quality PNG
        const dataUrl = await domtoimage.toPng(pageElement, {
          quality: 1.0,
          bgcolor: '#ffffff',
          width: 480 * 4, // 4x scaling
          height: 744 * 4,
          style: {
            transform: 'scale(4)',
            transformOrigin: 'top left',
            width: '480px',
            height: '744px',
          },
          filter: (node: Node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT') {
                return false;
              }
            }
            return true;
          }
        });

        // Clean up
        document.body.removeChild(tempContainer);
        document.head.removeChild(styleElement);

        // Get image dimensions
        const img = new Image();
        img.src = dataUrl;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        const originalWidth = img.width / 4;
        const originalHeight = img.height / 4;
        
        const widthRatio = availableWidth / originalWidth;
        const heightRatio = availableHeight / originalHeight;
        const scale = Math.min(widthRatio, heightRatio);
        
        const finalWidth = originalWidth * scale;
        const finalHeight = originalHeight * scale;
        
        const imgX = (pdfWidth - finalWidth) / 2;
        const imgY = (pdfHeight - finalHeight) / 2;

        // Add new page if not the first page
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Add image to PDF
        pdf.addImage(dataUrl, 'PNG', imgX, imgY, finalWidth, finalHeight, undefined, 'FAST');

      } catch (pageError) {
        console.error(`Error processing page ${page.page_number}:`, pageError);
        // Continue with other pages even if one fails
      }
    }

    // Download the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
