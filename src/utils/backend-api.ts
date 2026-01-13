/**
 * VirtualOutfit AI - Backend API Client
 * 
 * This module provides TypeScript functions to interact with the
 * Python backend's 3-step cost-optimized image generation pipeline.
 * 
 * Cost Optimization:
 * - analyze(): ~$0.0001 (vision analysis)
 * - generatePreview(): ~$0.02 (for "Try On" button)
 * - generateUltra(): ~$0.08 (for "Download HD" only)
 */

// Backend URL - defaults to localhost for development
// Backend URL - defaults to relative path in production, localhost in dev
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

// ============================================
// Types
// ============================================

interface AnalyzeRequest {
    image_base64: string;
    mime_type: string;
    product_description: string;
    generation_type: 'fashion' | 'jewellery' | 'flatlay';
}

interface AnalyzeResponse {
    prompt: string;
    model_used: string;
}

interface GenerateRequest {
    prompt: string;
    aspect_ratio?: string;
    negative_prompt?: string;
    image_base64?: string; // Optional but needed for FASHN.ai
}

interface GenerateResponse {
    image_base64: string;
    mime_type: string;
    model_used: string;
    quality: string;
}

interface FullGenerateRequest {
    image_base64: string;
    mime_type?: string;
    product_description?: string;
    generation_type?: 'fashion' | 'jewellery' | 'flatlay';
    quality?: 'preview' | 'ultra';
    aspect_ratio?: string;
    form_data?: Record<string, any>;
}

interface FullGenerateResponse {
    image_base64: string;
    mime_type: string;
    model_used: string;
    quality: string;
    base_prompt: string;
    enhanced_prompt: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Step 1: Analyze product image using Gemini Flash
 * Cost: ~$0.0001 per request
 */
export async function analyzeImage(params: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Analysis failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Step 2: Generate preview image using Imagen Fast
 * Cost: ~$0.02 per image
 * Use this for "Try On" button
 */
export async function generatePreview(params: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${BACKEND_URL}/api/generate/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: params.prompt,
            aspect_ratio: params.aspect_ratio || '3:4',
            negative_prompt: params.negative_prompt || '',
            image_base64: params.image_base64,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Preview generation failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Step 3: Generate ultra-quality image using Imagen Ultra
 * Cost: ~$0.08 per image
 * Use this ONLY for "Download HD" button
 */
export async function generateUltra(params: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${BACKEND_URL}/api/generate/ultra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: params.prompt,
            aspect_ratio: params.aspect_ratio || '3:4',
            negative_prompt: params.negative_prompt || '',
            image_base64: params.image_base64,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Ultra generation failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Combined pipeline: Analyze → Generate in one call
 * Automatically selects model based on quality parameter
 */
export async function generateImage(params: FullGenerateRequest): Promise<FullGenerateResponse> {
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image_base64: params.image_base64,
            mime_type: params.mime_type || 'image/jpeg',
            product_description: params.product_description || '',
            generation_type: params.generation_type || 'fashion',
            quality: params.quality || 'preview',
            aspect_ratio: params.aspect_ratio || '3:4',
            form_data: params.form_data || null,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Generation failed: ${response.statusText}`);
    }

    return response.json();
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert a File object to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Check if the backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}

// ============================================
// Usage Examples
// ============================================

/*
// Example 1: Quick preview generation (for "Try On" button)
const previewResult = await generateImage({
  image_base64: await fileToBase64(productImage),
  mime_type: productImage.type,
  product_description: "Red cotton summer dress",
  generation_type: "fashion",
  quality: "preview",  // Fast, cheap
  form_data: {
    gender: "Female",
    pose: "standing-confident",
    background: "studio-white"
  }
});

// Display preview
const previewUrl = `data:${previewResult.mime_type};base64,${previewResult.image_base64}`;


// Example 2: HD download (only when user clicks "Download HD")
const hdResult = await generateImage({
  image_base64: await fileToBase64(productImage),
  quality: "ultra",  // High quality, costs more
  ...sameOptions
});

// Trigger download
const hdUrl = `data:${hdResult.mime_type};base64,${hdResult.image_base64}`;
*/
