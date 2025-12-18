// Google Gemini API Configuration
// ⚠️ WARNING: For production use, store API keys in environment variables
// Add VITE_GEMINI_API_KEY to your .env file
// Never commit API keys to version control

const ENV_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY);
// ⚠️ NOTE: This key was provided for the demo session. In production, use environment variables.
const DEMO_API_KEY = 'AIzaSyB1r8cGfvmIQRW8HmIkzvo7zOLu7AzqbDQ';
const LOCAL_STORAGE_KEY = 'gemini_api_key';

// Use v1beta API endpoint with gemini-pro model (most stable)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const getGeminiApiKey = () => {
  return DEMO_API_KEY || ENV_API_KEY || '';
};

export const saveGeminiApiKey = (key: string) => {
  // No-op: Key is now managed via env/constants only
};

interface GenerationParams {
  productDescription: string;
  tabType: 'fashion' | 'jewellery' | 'flatlay';
  formData: any;
}

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
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
