import domtoimage from 'dom-to-image';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpeg';
}

export const generateThumbnailFromCanvas = async (
  canvasElement: HTMLElement,
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
    if (!canvasElement || !canvasElement.offsetWidth || !canvasElement.offsetHeight) {
      throw new Error('Invalid canvas element provided for thumbnail generation');
    }

    console.log('Generating thumbnail from canvas element');

    // Wait for any images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ensure all images are loaded before generating thumbnail
    const images = canvasElement.querySelectorAll('img');
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
    const dataUrl = await domtoimage.toPng(canvasElement, {
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

    console.log('Thumbnail generated successfully');
    return dataUrl;
  } catch (error) {
    console.error('Error generating thumbnail from canvas:', error);
    throw new Error('Failed to generate thumbnail from canvas');
  }
};
