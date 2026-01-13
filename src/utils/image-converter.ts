/**
 * Image Converter Utility
 * 
 * Handles conversion of various image formats (HEIC, HEIF, PNG, etc.)
 * to web-compatible formats (JPEG) for reliable processing.
 */

import heic2any from 'heic2any';

/**
 * Check if a file is a HEIC/HEIF image
 */
export function isHeicFile(file: File): boolean {
  const extension = file.name.toLowerCase().split('.').pop();
  const mimeType = file.type.toLowerCase();
  
  return (
    extension === 'heic' ||
    extension === 'heif' ||
    mimeType === 'image/heic' ||
    mimeType === 'image/heif' ||
    // Some devices report empty mime type for HEIC
    (mimeType === '' && (extension === 'heic' || extension === 'heif'))
  );
}

/**
 * Convert a HEIC/HEIF file to JPEG Blob
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
  try {
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    
    // heic2any can return a single blob or an array of blobs
    if (Array.isArray(result)) {
      return result[0];
    }
    return result;
  } catch (error) {
    console.error('HEIC conversion error:', error);
    throw new Error(`Failed to convert HEIC image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert any image file to a standardized JPEG/PNG data URL
 * Handles HEIC, PNG, JPEG, and other formats
 */
export async function convertToWebCompatible(file: File): Promise<{
  dataUrl: string;
  mimeType: string;
  originalName: string;
}> {
  let processedFile: File | Blob = file;
  let mimeType = file.type || 'image/jpeg';
  
  // Handle HEIC/HEIF files
  if (isHeicFile(file)) {
    console.log(`🔄 Converting HEIC file: ${file.name}`);
    try {
      processedFile = await convertHeicToJpeg(file);
      mimeType = 'image/jpeg';
      console.log(`✅ HEIC conversion successful: ${file.name}`);
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      throw error;
    }
  }
  
  // Read the file as data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      
      // Validate that we got valid image data
      if (!result || !result.startsWith('data:')) {
        reject(new Error(`Invalid image data from file: ${file.name}`));
        return;
      }
      
      resolve({
        dataUrl: result,
        mimeType: mimeType,
        originalName: file.name
      });
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    
    reader.readAsDataURL(processedFile);
  });
}

/**
 * Load an image and validate it can be rendered in a canvas
 * This ensures PNG/JPEG images are valid and can be processed
 */
export function loadAndValidateImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set up timeout for stuck image loads
    const timeoutId = setTimeout(() => {
      reject(new Error('Image load timeout - file may be corrupted or unsupported'));
    }, 30000); // 30 second timeout
    
    img.onload = () => {
      clearTimeout(timeoutId);
      
      // Validate minimum dimensions
      if (img.width < 10 || img.height < 10) {
        reject(new Error('Image dimensions too small'));
        return;
      }
      
      resolve(img);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load image - file may be corrupted or in an unsupported format'));
    };
    
    img.src = dataUrl;
  });
}

/**
 * Process an uploaded file for use in AI generation
 * Handles HEIC conversion, validation, and returns ready-to-use data
 */
export async function processUploadedImage(file: File): Promise<{
  url: string;
  name: string;
  size: number;
  mimeType: string;
}> {
  // Step 1: Convert to web-compatible format (handles HEIC)
  const converted = await convertToWebCompatible(file);
  
  // Step 2: Validate the image can be loaded
  try {
    await loadAndValidateImage(converted.dataUrl);
  } catch (error) {
    // If validation fails, try one more time with canvas conversion
    console.warn(`Initial image validation failed for ${file.name}, attempting canvas recovery...`);
    
    const recoveredUrl = await recoverImage(converted.dataUrl);
    return {
      url: recoveredUrl,
      name: file.name,
      size: file.size,
      mimeType: 'image/jpeg'
    };
  }
  
  return {
    url: converted.dataUrl,
    name: file.name,
    size: file.size,
    mimeType: converted.mimeType
  };
}

/**
 * Attempt to recover a problematic image by re-encoding it
 */
async function recoverImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }
        
        // Fill with white background (helps with PNG transparency issues)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Convert to JPEG
        const recoveredUrl = canvas.toDataURL('image/jpeg', 0.9);
        console.log('✅ Image recovered successfully via canvas re-encoding');
        resolve(recoveredUrl);
      } catch (error) {
        reject(new Error(`Canvas recovery failed: ${error}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Image is completely corrupted and cannot be recovered'));
    };
    
    img.src = dataUrl;
  });
}

/**
 * Get supported file extensions and MIME types for the file input
 */
export function getSupportedImageTypes(): string {
  return 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif';
}
