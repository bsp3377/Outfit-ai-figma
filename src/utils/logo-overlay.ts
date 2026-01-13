/**
 * Logo Overlay System
 * 
 * Client-side image processing utility that overlays exact logos onto AI-generated images
 * to guarantee pixel-perfect logo accuracy.
 * 
 * Features:
 * - Canvas-based image compositing
 * - Auto-positioning for common garment types
 * - Manual adjustment controls
 * - Realistic blending with lighting/fabric
 */

export interface LogoPlacement {
    x: number;              // X coordinate (0-1, normalized to image width)
    y: number;              // Y coordinate (0-1, normalized to image height)
    width: number;          // Logo width (0-1, normalized to image width)
    rotation: number;       // Rotation in degrees
    opacity: number;        // 0-1
    blendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
}

export interface OverlayParams {
    generatedImage: string;     // base64 data URL of AI-generated image
    logoImage: string;          // base64 data URL of logo
    placement: LogoPlacement;
}

/**
 * Load an image from a base64 data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });
}

/**
 * Main overlay function - composites logo onto generated image
 * @param params Overlay configuration
 * @returns base64 data URL of final composited image
 */
export async function overlayLogo(params: OverlayParams): Promise<string> {
    try {
        // 1. Load images
        const baseImg = await loadImage(params.generatedImage);
        const logoImg = await loadImage(params.logoImage);

        // 2. Create canvas matching base image dimensions
        const canvas = document.createElement('canvas');
        canvas.width = baseImg.width;
        canvas.height = baseImg.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        // 3. Draw base image
        ctx.drawImage(baseImg, 0, 0);

        // 4. Apply transformations for logo
        ctx.save();
        ctx.globalAlpha = params.placement.opacity;
        ctx.globalCompositeOperation = params.placement.blendMode;

        // Calculate absolute positioning from normalized values
        const x = baseImg.width * params.placement.x;
        const y = baseImg.height * params.placement.y;
        const width = baseImg.width * params.placement.width;
        const height = (logoImg.height / logoImg.width) * width; // Maintain aspect ratio

        // Apply rotation around center point
        if (params.placement.rotation !== 0) {
            const centerX = x + width / 2;
            const centerY = y + height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((params.placement.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
        }

        // 5. Draw logo with calculated dimensions
        ctx.drawImage(logoImg, x, y, width, height);

        ctx.restore();

        // 6. Export as PNG data URL
        return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
        console.error('Error overlaying logo:', error);
        throw new Error('Failed to overlay logo on image');
    }
}

/**
 * Auto-detect logo position based on garment type and image analysis
 * Uses heuristic positioning for common garment types
 * 
 * @param generatedImage base64 data URL of generated image
 * @param productType Type of product (apparel, accessory, etc.)
 * @param tabType Generation tab type
 * @returns Suggested logo placement
 */
export async function detectLogoPosition(
    generatedImage: string,
    productType: 'fashion' | 'jewellery' | 'flatlay',
    genderHint?: string,
    placementHint?: string
): Promise<LogoPlacement> {
    // Load image to get dimensions for aspect ratio consideration
    const img = await loadImage(generatedImage);
    const aspectRatio = img.width / img.height;

    // Default placement based on product type
    let placement: LogoPlacement;

    // Override if placement hint is 'background'
    if (placementHint === 'background') {
        return {
            x: 0.85,              // Bottom right corner
            y: 0.90,
            width: 0.12,
            rotation: 0,
            opacity: 0.85,
            blendMode: 'multiply'
        };
    }

    if (productType === 'fashion') {
        // Fashion/Apparel: Logo typically on chest area
        // Adjust for portrait vs landscape orientation
        const isPortrait = aspectRatio < 1;

        placement = {
            x: 0.42,              // Left chest area
            y: isPortrait ? 0.35 : 0.40,  // Adjust for orientation
            width: 0.08,          // ~8% of image width
            rotation: 0,
            opacity: 1.0,
            blendMode: 'normal'
        };

        // If hint is explicitly front (center)
        if (placementHint === 'center') {
            placement.x = 0.5;
            placement.y = 0.4;
            placement.width = 0.15;
        }

        // Adjust for different genders/ages if provided
        if (genderHint?.toLowerCase().includes('infant') || genderHint?.toLowerCase().includes('baby')) {
            placement.y = 0.40;   // Higher on infant clothing
            placement.width = 0.06; // Smaller logo
        }
    } else if (productType === 'jewellery') {
        // Accessories: Usually centered or on product itself
        placement = {
            x: 0.45,
            y: 0.50,
            width: 0.06,
            rotation: 0,
            opacity: 0.95,
            blendMode: 'multiply'  // Blend better with metallic surfaces
        };
    } else {
        // Flatlay: Bottom right or center
        placement = {
            x: 0.75,              // Bottom right corner
            y: 0.80,
            width: 0.10,
            rotation: 0,
            opacity: 0.90,
            blendMode: 'multiply'
        };
    }

    return placement;
}

/**
 * Create a logo placement with manual adjustments
 */
export function createManualPlacement(
    x: number,
    y: number,
    size: number,
    rotation: number = 0,
    opacity: number = 1.0,
    blendMode: LogoPlacement['blendMode'] = 'normal'
): LogoPlacement {
    return {
        x,
        y,
        width: size,
        rotation,
        opacity,
        blendMode
    };
}

/**
 * Preview logo placement without full processing
 * Returns a low-res preview for quick feedback
 */
export async function previewLogoPlacement(
    generatedImage: string,
    logoImage: string,
    placement: LogoPlacement,
    maxSize: number = 512
): Promise<string> {
    // Create smaller canvas for preview
    const baseImg = await loadImage(generatedImage);
    const scale = Math.min(1, maxSize / Math.max(baseImg.width, baseImg.height));

    const canvas = document.createElement('canvas');
    canvas.width = baseImg.width * scale;
    canvas.height = baseImg.height * scale;
    const ctx = canvas.getContext('2d')!;

    // Draw scaled base image
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // Overlay logo
    const logoImg = await loadImage(logoImage);
    ctx.save();
    ctx.globalAlpha = placement.opacity * 0.7; // Slightly transparent for preview

    const x = canvas.width * placement.x;
    const y = canvas.height * placement.y;
    const width = canvas.width * placement.width;
    const height = (logoImg.height / logoImg.width) * width;

    // Draw logo with dashed border for preview
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);

    ctx.globalCompositeOperation = placement.blendMode;
    ctx.drawImage(logoImg, x, y, width, height);

    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.8); // Lower quality for preview
}

/**
 * Utility: Convert File/Blob to base64 data URL
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
