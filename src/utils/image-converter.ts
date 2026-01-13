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
 * Convert any image to JPEG using canvas (fixes PNG with transparency issues)
 */
async function convertToJpegViaCanvas(dataUrl: string, fileName: string): Promise<string> {
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

                // Fill with white background (handles PNG transparency)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the image
                ctx.drawImage(img, 0, 0);

                // Convert to JPEG at high quality
                const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
                console.log(`✅ Converted ${fileName} to JPEG via canvas`);
                resolve(jpegUrl);
            } catch (error) {
                reject(new Error(`Canvas conversion failed: ${error}`));
            }
        };

        img.onerror = () => {
            reject(new Error(`Failed to load image for canvas conversion: ${fileName}`));
        };

        // Set a timeout for image loading
        setTimeout(() => {
            reject(new Error(`Image load timeout during canvas conversion: ${fileName}`));
        }, 30000);

        img.src = dataUrl;
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
    let dataUrl: string;
    try {
        dataUrl = await readFileAsDataUrl(processedFile);
    } catch (error) {
        console.error('Failed to read file:', error);
        throw new Error(`Failed to read file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // For PNG files, convert to JPEG to avoid transparency issues during generation
    const isPng = mimeType === 'image/png' || file.name.toLowerCase().endsWith('.png');
    if (isPng) {
        console.log('🔄 Converting PNG to JPEG for compatibility...');
        try {
            dataUrl = await convertToJpegViaCanvas(dataUrl, file.name);
            mimeType = 'image/jpeg';
        } catch (error) {
            console.warn('PNG conversion failed, using original:', error);
            // Keep the original PNG if conversion fails
        }
    }

    console.log(`✅ Image processed successfully: ${file.name}`);

    return {
        url: dataUrl,
        name: file.name,
        size: file.size,
        mimeType: mimeType
    };
}

/**
 * Get supported file extensions and MIME types for the file input
 */
export function getSupportedImageTypes(): string {
    return 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif';
}
