// Google Gemini API Configuration
// ⚠️ WARNING: For production use, store API keys in environment variables
// Add VITE_GEMINI_API_KEY to your .env file
// Never commit API keys to version control

const ENV_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY);
// ⚠️ NOTE: This key was provided for the demo session. In production, use environment variables.
const DEMO_API_KEY = 'AIzaSyB1r8cGfvmIQRW8HmIkzvo7zOLu7AzqbDQ';
const LOCAL_STORAGE_KEY = 'gemini_api_key';

// Image generation model endpoint
const GEMINI_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Text generation model endpoint (for prompt generation fallback)
const GEMINI_TEXT_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const getGeminiApiKey = () => {
  return ENV_API_KEY || DEMO_API_KEY || '';
};

export const saveGeminiApiKey = (key: string) => {
  // No-op: Key is now managed via env/constants only
};

interface GenerationParams {
  productDescription: string;
  tabType: 'fashion' | 'jewellery' | 'flatlay';
  formData: any;
}

interface ImageGenerationParams {
  productDescription: string;
  tabType: 'fashion' | 'jewellery' | 'flatlay';
  formData: any;
  productImageBase64?: string; // Base64 encoded product image
  productImageMimeType?: string; // e.g., 'image/png', 'image/jpeg'
}

interface ImageGenerationResult {
  imageBase64: string;
  mimeType: string;
  promptUsed: string;
}

/**
 * Build a detailed prompt for image generation based on form inputs
 */
function buildImagePrompt(params: ImageGenerationParams): string {
  const { productDescription, tabType, formData } = params;

  if (tabType === 'fashion') {
    const age = formData.age ? `${formData.age} year old` : '';
    const ethnicity = formData.ethnicity || '';
    const gender = formData.gender || 'Female';
    const hairstyle = formData.hairstyle?.replace(/-/g, ' ') || '';
    const pose = formData.pose?.replace(/-/g, ' ') || 'standing';
    const background = formData.background?.replace(/-/g, ' ') || 'studio';
    const camera = formData.camera || '50mm f/1.8';
    const lighting = formData.lighting?.replace(/-/g, ' ') || 'softbox';
    const keyLight = formData.keyLight ? `, ${formData.keyLight} key light` : '';
    const advancedPrompt = formData.advancedPrompt ? `. ${formData.advancedPrompt}` : '';

    return `Professional high-end e-commerce fashion photography: A ${age} ${ethnicity} ${gender} model with ${hairstyle} hairstyle, in a ${pose} pose, wearing/modeling the product shown in the reference image. ${background} background, shot with ${camera}, ${lighting} lighting${keyLight}. The model should be wearing or elegantly displaying the exact garment/product from the uploaded image. Photorealistic, commercial quality, high-end fashion photography, sharp focus, professional studio lighting${advancedPrompt}. Product description: ${productDescription}`;
  } else if (tabType === 'jewellery') {
    const shotStyle = formData.accessoriesShotStyle?.replace(/-/g, ' ') || 'clean studio';
    const framing = formData.accessoriesFraming?.replace(/-/g, ' ') || 'head and shoulders';
    const emphasis = formData.accessoriesProductEmphasis?.replace(/-/g, ' ') || 'product hero';
    const background = formData.accessoriesBackground?.replace(/-/g, ' ') || 'solid light';
    const lighting = formData.accessoriesLighting?.replace(/-/g, ' ') || 'softbox 45 degrees';
    const cameraLook = formData.accessoriesCameraLook?.replace(/-/g, ' ') || 'macro portrait 105mm';
    const depth = formData.accessoriesDepth?.replace(/-/g, ' ') || 'shallow';
    const retouch = formData.accessoriesRetouch?.replace(/-/g, ' ') || 'clean editorial';
    const pose = formData.accessoriesPose?.replace(/-/g, ' ') || 'product near face';

    return `Professional jewelry/accessories product photography: ${shotStyle} style, ${framing} framing, ${emphasis} emphasis. Model elegantly wearing or displaying the jewelry/accessory from the reference image. ${background} background, ${lighting} lighting, ${cameraLook} lens look, ${depth} depth of field, ${retouch} retouching style. Model pose: ${pose}. High-end commercial jewelry photography, luxury aesthetic, sharp product focus. Product description: ${productDescription}`;
  } else {
    // Creative/Flatlay
    const theme = formData.flatlayTheme?.replace(/-/g, ' ') || 'minimal';
    const layout = formData.flatlayLayout?.replace(/-/g, ' ') || 'centered';
    const category = formData.creativeProductCategory?.replace(/-/g, ' ') || 'apparel';
    const shotType = formData.creativeShotType?.replace(/-/g, ' ') || 'packshot';
    const angle = formData.creativeAngle?.replace(/-/g, ' ') || '45 degree';
    const background = formData.creativeBackground?.replace(/-/g, ' ') || 'pure white';
    const lighting = formData.creativeLighting?.replace(/-/g, ' ') || 'softbox';
    const shadow = formData.creativeShadow?.replace(/-/g, ' ') || 'soft shadow';
    const colorMood = formData.creativeColorMood?.replace(/-/g, ' ') || 'neutral true';

    return `Professional ${theme} flatlay product photography: ${layout} layout composition for ${category}. ${shotType} style, ${angle} camera angle, ${background} background, ${lighting} lighting with ${shadow}. ${colorMood} color mood. The product from the reference image should be the hero element, styled beautifully for e-commerce. Commercial quality, sharp focus, professional product photography. Product description: ${productDescription}`;
  }
}

/**
 * Generate an image using Gemini's image generation capabilities
 * Uses the gemini-2.0-flash-exp model with image generation support
 */
export async function generateImageWithGemini(params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const { productImageBase64, productImageMimeType } = params;
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add it in Account Settings.');
  }

  const prompt = buildImagePrompt(params);
  console.log('🎨 Generated prompt:', prompt);

  // Build the request parts
  const parts: any[] = [
    { text: prompt }
  ];

  // If we have a product image, include it for reference/editing
  if (productImageBase64 && productImageMimeType) {
    parts.push({
      inlineData: {
        mimeType: productImageMimeType,
        data: productImageBase64
      }
    });
  }

  try {
    const response = await fetch(`${GEMINI_IMAGE_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }],
        generationConfig: {
          responseModalities: ['Text', 'Image'],
          temperature: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini Image API Error Response:', errorData);
      
      // Check for specific error types
      if (response.status === 400 && errorData.error?.message?.includes('not supported')) {
        throw new Error('Image generation is not available with the current API key. Please ensure you have access to Gemini image generation models.');
      }
      if (response.status === 403) {
        throw new Error('API key does not have permission for image generation. Please check your API key settings.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      
      throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini Image API Response:', data);

    // Extract image from response
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

    const parts_response = candidates[0]?.content?.parts || [];
    let imageBase64 = '';
    let mimeType = 'image/png';
    let textResponse = '';

    for (const part of parts_response) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/png';
      }
      if (part.text) {
        textResponse = part.text;
      }
    }

    if (!imageBase64) {
      // If no image was generated, the model might have returned text only
      console.warn('No image in response. Text response:', textResponse);
      throw new Error('Image generation failed. The model did not return an image. Please try again with a different prompt.');
    }

    return {
      imageBase64,
      mimeType,
      promptUsed: prompt
    };

  } catch (error) {
    console.error('Error calling Gemini Image API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate image with Gemini AI');
  }
}

/**
 * Legacy function - generates text prompts only (kept for backwards compatibility)
 */
export async function generateWithGemini(params: GenerationParams): Promise<string> {
  const { productDescription, tabType, formData } = params;
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add it in Account Settings.');
  }

  // Build detailed prompt based on tab type and settings
  let prompt = '';

  if (tabType === 'fashion') {
    prompt = `Generate a detailed prompt for an AI image generation model to create a studio-quality fashion product photo with the following specifications:

Product: ${productDescription}

Model Specifications:
- Gender: ${formData.gender}
- Age: ${formData.age || 'Not specified'}
- Ethnicity: ${formData.ethnicity}
- Hairstyle: ${formData.hairstyle}
- Pose: ${formData.pose}

Photography Settings:
- Background: ${formData.background}
- Camera: ${formData.camera}
- Lighting: ${formData.lighting}
${formData.keyLight ? `- Key Light: ${formData.keyLight}` : ''}

${formData.logoEnabled ? `Logo Settings:
- Placement: ${formData.logoPlacement}
- Focus: ${formData.logoFocus}
- Location: ${formData.logoLocation || 'Not specified'}` : ''}

${formData.advancedPrompt ? `Additional Instructions: ${formData.advancedPrompt}` : ''}

Please provide a concise, professional prompt for generating this image.`;
  } else if (tabType === 'jewellery') {
    prompt = `Generate a detailed prompt for an AI image generation model to create a studio-quality accessories/jewelry product photo with the following specifications:

Product: ${productDescription}

Photography Specifications:
- Shot Style: ${formData.accessoriesShotStyle}
- Framing: ${formData.accessoriesFraming}
- Product Emphasis: ${formData.accessoriesProductEmphasis}
- Background: ${formData.accessoriesBackground}
- Lighting: ${formData.accessoriesLighting}
- Camera Look: ${formData.accessoriesCameraLook}
- Depth of Field: ${formData.accessoriesDepth}
- Retouch Level: ${formData.accessoriesRetouch}
- Model Pose: ${formData.accessoriesPose}

Please provide a concise, professional prompt for generating this image.`;
  } else {
    prompt = `Generate a detailed prompt for an AI image generation model to create a studio-quality flatlay product photo with the following specifications:

Product: ${productDescription}

Layout Specifications:
- Theme: ${formData.flatlayTheme}
- Layout: ${formData.flatlayLayout}

Please provide a concise, professional prompt for generating this image.`;
  }

  try {
    const response = await fetch(`${GEMINI_TEXT_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error Response:', errorData);
      throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', data);
    
    const generatedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!generatedPrompt) {
      console.warn('No prompt generated, using fallback');
      throw new Error('Empty response from Gemini API');
    }
    
    return generatedPrompt;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Re-throw with more details
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate prompt with Gemini AI');
  }
}

// Test function to verify API key is working
export async function testGeminiConnection(): Promise<boolean> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return false;

  try {
    const response = await fetch(`${GEMINI_TEXT_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, this is a test message. Please respond with "OK" if you can read this.'
          }]
        }],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Gemini API connection test failed:', error);
    return false;
  }
}
