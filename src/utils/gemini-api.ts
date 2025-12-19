// Google Gemini API Configuration
// ⚠️ WARNING: For production use, store API keys in environment variables
// Add VITE_GEMINI_API_KEY to your .env file
// Never commit API keys to version control

const ENV_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY);
// ⚠️ NOTE: This key was provided for the demo session. In production, use environment variables.
const DEMO_API_KEY = 'AQ.Ab8RN6J8hxBR5S5caBqUGphKyKWpraxSJWdCKSg5t030Veuejw';
const LOCAL_STORAGE_KEY = 'gemini_api_key';

// Image generation model endpoint
const GEMINI_IMAGE_API_URL = 'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3-pro-image-preview:generateContent';

// Text generation model endpoint (for prompt generation fallback)
const GEMINI_TEXT_API_URL = 'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent';

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

interface ProductImage {
  base64: string;
  mimeType: string;
  name?: string; // Optional name/description of the product
}

interface ImageGenerationParams {
  productDescription: string;
  tabType: 'fashion' | 'jewellery' | 'flatlay';
  formData: any;
  productImages?: ProductImage[]; // Array of up to 5 product images
  // Legacy single image support (deprecated, use productImages array instead)
  productImageBase64?: string;
  productImageMimeType?: string;
  logoImageBase64?: string;
  logoImageMimeType?: string;
  inspiredTemplateBase64?: string;
  inspiredTemplateMimeType?: string;
}

interface ImageGenerationResult {
  imageBase64: string;
  mimeType: string;
  promptUsed: string;
}

/**
 * Build a detailed prompt for image generation based on form inputs
 * Includes logo placement instructions and inspired template references
 */
function buildImagePrompt(params: ImageGenerationParams): string {
  const { productDescription, tabType, formData, logoImageBase64, inspiredTemplateBase64 } = params;

  // Quality enhancement suffix for all prompts
  const qualitySuffix = '8K resolution, ultra-detailed, professional retouching, magazine-quality, high dynamic range, pristine clarity, luxury aesthetic.';

  // Background color instructions
  const colorState = formData.colorState;
  let colorInstructions = '';

  if (colorState && colorState.mode === 'solid') {
    colorInstructions = `with a solid ${colorState.solid} background color`;
  } else if (colorState && colorState.mode === 'gradient') {
    const { start, end, style } = colorState.gradient;
    const styleText = style === 'radial' ? 'radial' : style === 'linear' ? 'linear' : 'diagonal';
    colorInstructions = `with a ${styleText} gradient background fading from ${start} to ${end}`;
  }

  // Logo instructions if logo is provided
  const logoInstructions = logoImageBase64
    ? `CRITICAL REQUIREMENT: You MUST include the brand logo (provided in the logo reference image) in the generated image. It is NOT optional. Place it ${formData.logoPlacement || 'on the background wall'} in a ${formData.logoFocus === 'subtle' ? 'tasteful, subtle manner' : 'clear, prominent position'}${formData.logoLocation ? ` at ${formData.logoLocation}` : ''}. The logo should look realistic, as if it's part of the physical environment (e.g., printed on signage, a wall decal, or prop branding).`
    : '';

  // Strict negative constraint to prevent lighting equipment from appearing
  const negativeConstraint = 'CRITICAL: Do NOT show any lighting equipment, cameras, softboxes, stands, studio gear, or production tools in the image. The image must be a finished commercial shot, not a behind-the-scenes look.';



  // Inspired template instructions
  const templateInstructions = inspiredTemplateBase64
    ? 'IMPORTANT: Use the style, composition, color palette, lighting, and overall aesthetic from the inspired template image as a strong reference. Match the visual mood, layout approach, and styling while featuring the product from the product reference image.'
    : '';

  if (tabType === 'fashion') {
    const age = formData.age ? `${formData.age} year old` : 'young adult';
    const ethnicity = formData.ethnicity || 'diverse';
    const gender = formData.gender || 'Female';
    const hairstyle = formData.hairstyleDescription || formData.hairstyle?.replace(/-/g, ' ') || 'styled';
    const pose = formData.poseDescription || formData.pose?.replace(/-/g, ' ') || 'confident standing';

    let background = formData.backgroundDescription || getEnhancedBackground(formData.background) || 'premium studio with gradient lighting';
    if (formData.background === 'solid') {
      background = `clean studio ${colorInstructions}`;
    }

    const camera = formData.cameraDescription || formData.camera || '85mm f/1.4 portrait lens, ISO 100';
    const lighting = formData.lightingDescription || getEnhancedLighting(formData.lighting) || 'professional three-point lighting with softbox';
    const keyLight = formData.keyLight ? `, ${formData.keyLight} key light positioning` : '';
    const advancedPrompt = formData.advancedPrompt ? `. Additional creative direction: ${formData.advancedPrompt}` : '';

    return `Ultra-premium high-end e-commerce fashion photography: A stunning ${age} ${ethnicity} ${gender} model with ${hairstyle} hairstyle, in a ${pose} pose, wearing and elegantly showcasing ALL the products from the reference images together in a single cohesive outfit look. ${background}, photographed with ${camera}, ${lighting}${keyLight}. The model should be impeccably styled, wearing ALL the exact garments/products/accessories from the uploaded images with perfect fit and styling. Each product must be clearly visible and featured. Photorealistic, Vogue-quality commercial photography, razor-sharp focus on product details, flawless skin retouching, cinematic color grading. ${templateInstructions} ${logoInstructions}${advancedPrompt} Products: ${productDescription}. ${qualitySuffix} ${negativeConstraint}`;

  } else if (tabType === 'jewellery') {
    const shotStyle = formData.accessoriesShotStyle?.replace(/-/g, ' ') || 'luxury editorial';
    const framing = formData.accessoriesFraming?.replace(/-/g, ' ') || 'elegant close-up';
    const emphasis = formData.accessoriesProductEmphasis?.replace(/-/g, ' ') || 'product hero with model';

    let background = formData.accessoriesBackground?.replace(/-/g, ' ') || 'soft gradient studio';
    if (formData.accessoriesBackground === 'color-picker') {
      background = `clean studio ${colorInstructions}`;
    }

    const lighting = getEnhancedLighting(formData.accessoriesLighting) || 'dramatic rim lighting with soft fill';
    const cameraLook = formData.accessoriesCameraLook?.replace(/-/g, ' ') || 'macro portrait 105mm f/2.8';
    const depth = formData.accessoriesDepth?.replace(/-/g, ' ') || 'shallow bokeh';
    const retouch = formData.accessoriesRetouch?.replace(/-/g, ' ') || 'flawless editorial';
    const pose = formData.accessoriesPose?.replace(/-/g, ' ') || 'jewelry prominently featured';

    return `Ultra-premium jewelry/accessories advertising photography: ${shotStyle} styling, ${framing} with ${emphasis}. An elegant model gracefully wearing or displaying ALL the jewelry/accessories from the reference images together as a coordinated look. ${background} backdrop, ${lighting}, shot with ${cameraLook} lens for ${depth} effect, ${retouch} level retouching. Model pose: ${pose}. Cartier/Tiffany-level luxury aesthetic, each piece must be clearly visible - gemstones sparkling with perfect light refraction, metal surfaces gleaming, impeccable focus on every product with beautiful model complement. ${templateInstructions} ${logoInstructions} Products: ${productDescription}. ${qualitySuffix} ${negativeConstraint}`;

  } else {
    // Creative/Flatlay
    const theme = formData.flatlayTheme?.replace(/-/g, ' ') || 'modern minimalist';
    const layout = formData.flatlayLayout?.replace(/-/g, ' ') || 'artistic centered';
    const category = formData.creativeProductCategory?.replace(/-/g, ' ') || 'premium apparel';
    const shotType = formData.creativeShotType?.replace(/-/g, ' ') || 'hero packshot';
    const angle = formData.creativeAngle?.replace(/-/g, ' ') || 'optimal 45 degree';

    let background = getEnhancedBackground(formData.creativeBackground) || 'pure white infinity';
    if (formData.creativeBackground === 'color-picker' || formData.creativeBackground === 'solid-color' || formData.creativeBackground === 'soft-gradient') {
      background = `clean studio ${colorInstructions}`;
    }

    const lighting = getEnhancedLighting(formData.creativeLighting) || 'soft diffused studio lighting';
    const shadow = formData.creativeShadow?.replace(/-/g, ' ') || 'gentle soft shadow';
    const colorMood = formData.creativeColorMood?.replace(/-/g, ' ') || 'true neutral colors';
    const props = formData.creativeProps?.replace(/-/g, ' ');
    const composition = formData.creativeComposition?.replace(/-/g, ' ') || 'rule of thirds hero';

    const propsText = props && props !== 'none' ? ` Styled with ${props} as complementary props.` : '';

    return `Ultra-premium ${theme} product photography: ${layout} ${composition} for ${category}. ${shotType} style captured from ${angle} camera angle. ${background} background, ${lighting} with ${shadow}. ${colorMood} color grading. The product from the reference image is the hero element, styled beautifully for high-end e-commerce.${propsText} ${templateInstructions} ${logoInstructions} Product: ${productDescription}. ${qualitySuffix} ${negativeConstraint}`;
  }
}

/**
 * Get enhanced background descriptions for more professional results
 */
function getEnhancedBackground(background: string | undefined): string {
  const backgroundMap: Record<string, string> = {
    'studio': 'premium professional studio with seamless backdrop',
    'white': 'pure white infinity cove studio',
    'gradient': 'sophisticated gradient backdrop with subtle color transition',
    'urban': 'upscale urban environment with architectural elements',
    'natural': 'elegant natural setting with soft bokeh',
    'luxury': 'opulent luxury interior with rich textures',
    'minimal': 'ultra-clean minimalist white space',
    'dark': 'dramatic dark moody studio with accent lighting',
    'outdoor': 'beautiful natural outdoor setting with golden hour lighting',
    'concrete': 'sleek industrial concrete with artistic lighting',
    'marble': 'luxurious white marble surface with soft reflections',
    'fabric': 'elegant draped fabric backdrop with soft folds',
    'solid-light': 'clean solid light backdrop',
    'solid-dark': 'sophisticated solid dark backdrop',
    'pure-white': 'pristine pure white infinity cove',
    'off-white': 'warm off-white textured backdrop',
    'luxury-penthouse': 'modern luxury penthouse interior with city view',
    'urban-street': 'chic city street with blurred urban background',
    'minimalist-studio': 'high-end minimalist architectural studio space',
    'nature-beach': 'serene luxury beach setting with soft natural light',
    'industrial-chic': 'modern industrial loft with brick and large windows',
    'botanical-garden': 'lush botanical garden with filtered sunlight',
    'abstract-geometric': 'abstract geometric architectural forms with light and shadow',
    'warm-boho': 'warm bohemian interior with natural textures',
  };

  if (!background) return backgroundMap['studio'];
  const key = background.toLowerCase().replace(/-/g, '');
  return backgroundMap[key] || background.replace(/-/g, ' ');
}

/**
 * Get enhanced lighting descriptions for more professional results
 */
function getEnhancedLighting(lighting: string | undefined): string {
  const lightingMap: Record<string, string> = {
    'softbox': 'soft, diffused professional lighting with gentle shadows',
    'softbox-45': 'directional soft lighting at 45 degrees, creating dimension',
    'ring': 'even, shadowless beauty lighting',
    'natural': 'natural window light with soft diffusion',
    'dramatic': 'dramatic chiaroscuro lighting with deep shadows',
    'flat': 'even flat lighting for product clarity',
    'rim': 'artistic rim lighting giving a halo effect',
    'butterfly': 'classic glamour lighting pattern',
    'rembrandt': 'sophisticated directional lighting with triangle highlight',
    'split': 'dramatic side lighting creating strong contrast',
    'golden': 'warm golden hour natural lighting',
    'studio': 'professional studio lighting environment',
    'golden-hour': 'warm, glowing golden hour sunlight',
    'studio-high-key': 'bright, airy high-key illumination',
    'moody-cinematic': 'atmospheric moody cinematic lighting with color contrast',
    'neon-glow': 'modern neon accent lighting with cool tones',
    'soft-daylight': 'clean, neutral soft daylight simulation',
  };

  if (!lighting) return lightingMap['softbox'];
  const key = lighting.toLowerCase().replace(/-/g, '');
  return lightingMap[key] || lighting.replace(/-/g, ' ');
}

/**
 * Generate an image using Gemini's image generation capabilities
 * Uses the gemini-3-pro-image-preview model with image generation support
 * Supports product images, logos, and inspired templates as references
 */
export async function generateImageWithGemini(params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const {
    productImages,
    productImageBase64,
    productImageMimeType,
    logoImageBase64,
    logoImageMimeType,
    inspiredTemplateBase64,
    inspiredTemplateMimeType
  } = params;
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add it in Account Settings.');
  }

  const prompt = buildImagePrompt(params);
  console.log('🎨 Generated prompt:', prompt);

  // Build the request parts - order matters for context
  const parts: any[] = [
    { text: prompt }
  ];

  // Add all product images (new multi-image support)
  if (productImages && productImages.length > 0) {
    const productCount = productImages.length;
    parts.push({
      text: `[PRODUCT IMAGES - The model must be wearing/using ALL ${productCount} of the following products together in the same image]`
    });

    productImages.forEach((img, index) => {
      const productLabel = img.name || `Product ${index + 1}`;
      parts.push({
        text: `[PRODUCT ${index + 1}: ${productLabel}]`
      });
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64
        }
      });
    });
    console.log(`📦 Including ${productCount} product images for generation`);
  }
  // Legacy single image support (fallback)
  else if (productImageBase64 && productImageMimeType) {
    parts.push({
      text: '[PRODUCT IMAGE - This is the main product to feature in the generated image]'
    });
    parts.push({
      inlineData: {
        mimeType: productImageMimeType,
        data: productImageBase64
      }
    });
  }

  // Add logo image if provided
  if (logoImageBase64 && logoImageMimeType) {
    parts.push({
      text: '[BRAND LOGO - Subtly integrate this logo into the background of the generated image]'
    });
    parts.push({
      inlineData: {
        mimeType: logoImageMimeType,
        data: logoImageBase64
      }
    });
    console.log('🏷️ Including brand logo in generation');
  }

  // Add inspired template if provided (for Creative/Flatlay tab)
  if (inspiredTemplateBase64 && inspiredTemplateMimeType) {
    parts.push({
      text: '[STYLE REFERENCE - Use this as inspiration for the style, composition, and aesthetic of the generated image]'
    });
    parts.push({
      inlineData: {
        mimeType: inspiredTemplateMimeType,
        data: inspiredTemplateBase64
      }
    });
    console.log('✨ Including inspired template as style reference');
  }

  try {
    const response = await fetch(`${GEMINI_IMAGE_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: parts
        }],
        generationConfig: {
          responseModalities: ['Text', 'Image'],
          temperature: 0.7, // Slightly lower for more consistent quality
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
          role: 'user',
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
          role: 'user',
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
