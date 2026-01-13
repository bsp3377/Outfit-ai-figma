/**
 * Image Converter Utility
 * 
 * Handles conversion of various image formats (HEIC, HEIF, PNG, etc.)
 * to web-compatible formats for reliable processing.
 */

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
 * Dynamically import heic2any to avoid SSR issues
 */
async function getHeic2Any() {
    const heic2any = await import('heic2any');
    return heic2any.default;
}

/**
 * Convert a HEIC/HEIF file to JPEG Blob
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
    try {
        console.log('🔄 Starting HEIC conversion for:', file.name);
        const heic2any = await getHeic2Any();

        const result = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
        });

        // heic2any can return a single blob or an array of blobs
        if (Array.isArray(result)) {
            console.log('✅ HEIC conversion successful (array result)');
            return result[0];
        }
        console.log('✅ HEIC conversion successful');
        return result;
    } catch (error) {
        console.error('❌ HEIC conversion error:', error);
        throw new Error(`Failed to convert HEIC image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Read a file as data URL with proper error handling
 */
function readFileAsDataUrl(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            if (result && result.startsWith('data:')) {
                resolve(result);
            } else {
                reject(new Error('Invalid data URL result'));
            }
        };

        reader.onerror = () => {
            reject(new Error(`Failed to read file: ${reader.error?.message || 'Unknown error'}`));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Process an uploaded file for use in AI generation
 * Handles HEIC conversion and returns ready-to-use data
 */
export async function processUploadedImage(file: File): Promise<{
    url: string;
    name: string;
    size: number;
    mimeType: string;
}> {
    console.log(`📷 Processing image: ${file.name} (type: ${file.type}, size: ${file.size})`);

    let processedFile: File | Blob = file;
    let mimeType = file.type || 'image/jpeg';

    // Handle HEIC/HEIF files - convert to JPEG
    if (isHeicFile(file)) {
        console.log('🔄 Detected HEIC file, converting...');
        try {
            processedFile = await convertHeicToJpeg(file);
            mimeType = 'image/jpeg';
        } catch (error) {
            console.error('HEIC conversion failed:', error);
            throw error;
        }
    }

    // Read the file as data URL
    try {
        const dataUrl = await readFileAsDataUrl(processedFile);
        console.log(`✅ Image processed successfully: ${file.name}`);

        return {
            url: dataUrl,
            name: file.name,
            size: file.size,
            mimeType: mimeType
        };
    } catch (error) {
        console.error('Failed to read file:', error);
        throw new Error(`Failed to read file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get supported file extensions and MIME types for the file input
 */
export function getSupportedImageTypes(): string {
    return 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif';
}
