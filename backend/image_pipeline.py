"""
VirtualOutfit AI - Cost-Optimized Image Generation Pipeline

This module implements a pipeline for generating AI fashion photography using fashn.ai:
1. Prompt Construction - Create optimized prompt from user input
2. Preview Generation (fashn.ai '1k') - Fast generation
3. Ultra Quality Generation (fashn.ai '4k') - High quality generation

"""

import os
import base64
import logging
from typing import Optional, Dict, Any

import json
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
from dotenv import load_dotenv
from fashn_provider import FashnProvider
from google.oauth2 import service_account

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Provider
_fashn_provider = None
_vertex_model = None

def get_fashn_provider():
    global _fashn_provider
    if _fashn_provider is None:
        _fashn_provider = FashnProvider()
    return _fashn_provider

def get_vertex_model():
    global _vertex_model
    if _vertex_model is None:
        # Initialize Vertex AI
        try:
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
            location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
            
            # check for Vercel/Cloud env var with JSON credentials
            google_creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
            
            if google_creds_json:
                try:
                    logger.info("Loading Google Credentials from GOOGLE_CREDENTIALS_JSON env var...")
                    creds_dict = json.loads(google_creds_json)
                    credentials = service_account.Credentials.from_service_account_info(creds_dict)
                    
                    # Initialize with explicit credentials
                    # Note: project argument matches the loading project, usually in the JSON
                    project = project_id or creds_dict.get("project_id")
                    
                    vertexai.init(project=project, location=location, credentials=credentials)
                    _vertex_model = ImageGenerationModel.from_pretrained("imagegeneration@006")
                    logger.info("Vertex AI initialized with JSON credentials")
                    return _vertex_model
                except Exception as json_err:
                    logger.error(f"Failed to load credentials from JSON env var: {json_err}")
                    # Fallthrough to default method
            
            # Standard initialization (File path or Default Creds)
            if project_id:
                vertexai.init(project=project_id, location=location)
                _vertex_model = ImageGenerationModel.from_pretrained("imagegeneration@006")
                logger.info("Vertex AI ImageGenerationModel initialized")
            else:
                 # Attempt auto-discovery
                vertexai.init(location=location)
                _vertex_model = ImageGenerationModel.from_pretrained("imagegeneration@006")
                logger.info("Vertex AI initialized (auto-discovery)")
        except Exception as e:
            logger.warning(f"Vertex AI initialization failed: {e}")
            
    return _vertex_model

def initialize_services():
    """Explicitly initialize services for startup checks."""
    logger.info("Initializing services...")
    get_fashn_provider()
    get_vertex_model()
    logger.info("Services initialized.")

# ============================================
# STEP 1: Vision Analysis / Prompt Construction
# ============================================

async def analyze_outfit_image(
    image_data: bytes,
    mime_type: str = "image/jpeg",
    product_description: str = "",
    generation_type: str = "fashion"
) -> str:
    """
    Step 1: Construct a prompt for the image.
    
    Previously used Gemini Vision, now simplified to use user description directly
    plus some template formatting to save costs/complexity.
    
    Args:
        image_data: Raw bytes of the uploaded image
        mime_type: MIME type of the image
        product_description: User's description of the product
        generation_type: Type of generation (fashion, jewellery, flatlay)
    
    Returns:
        A detailed text prompt for image generation
    """
    # Simple pass-through construction. 
    # In a real "Vision" scenario we'd use an LLM, but for now we rely on the user's text.
    
    if generation_type == "fashion":
        base = product_description or "A stylish fashion product"
        return f"Professional fashion photography of {base}, worn by a model, high quality, realistic texture"
    elif generation_type == "jewellery":
        base = product_description or "A piece of jewelry"
        return f"Professional macro photography of {base}, worn by a model, cinematic lighting, ultra detailed"
    else:
        base = product_description or "A product"
        return f"Professional product photography of {base}, studio lighting, high resolution"


# ============================================
# STEP 2: Preview Generation (1k Resolution)
# ============================================

async def generate_preview(
    prompt: str,
    aspect_ratio: str = "3:4",
    negative_prompt: str = "",
    image_base64_input: Optional[str] = None # We need the input image now!
) -> dict:
    """
    Step 2: Generate a preview image using fashn.ai (1k resolution).
    """
    try:
        provider = get_fashn_provider()
        
        # Ensure we have the input image passed down. 
        # Note: The original signature didn't have image_base64_input, 
        # but fashn.ai NEEDS the product image for 'product-to-model'.
        # We will need to update the caller to pass this.
        
        if not image_base64_input:
            raise ValueError("Input image is required for Fashn.ai generation")

        # Prepare the image string (ensure it has prefix if raw base64, or just pass if URL)
        # Assuming input is raw base64 from our frontend decoding
        if not image_base64_input.startswith("http") and not image_base64_input.startswith("data:"):
            # Add minimal prefix for fashn.ai if needed, or assume it handles raw base64? 
            # Ops, request says "image URL | base64". Usually raw base64 needs data URI scheme for clarity.
            image_input = f"data:image/jpeg;base64,{image_base64_input}"
        else:
            image_input = image_base64_input

        result_data = await provider.run_product_to_model(
            product_image=image_input,
            prompt=prompt,
            negative_prompt=negative_prompt,
            aspect_ratio=aspect_ratio,
            resolution="1k"
        )
        
        # Extract output
        outputs = result_data.get("output", [])
        if not outputs:
            raise ValueError("No output images returned from Fashn.ai")
            
        output_image = outputs[0] # This matches the data:image... format if return_base64=True

        # Strip prefix for internal consistency if needed
        if output_image.startswith("data:image"):
            # Split at comma e.g. "data:image/png;base64,....."
            _, b64_data = output_image.split(",", 1)
        else:
            b64_data = output_image
            
        return {
            "image_base64": b64_data,
            "mime_type": "image/png",
            "model_used": "fashn-product-to-model-1k",
            "quality": "preview"
        }
        
    except Exception as e:
        logger.error(f"Preview generation failed: {str(e)}")
        raise


# ============================================
# STEP 3: Ultra Quality Generation (4k Resolution)
# ============================================

async def generate_ultra_quality(
    prompt: str,
    aspect_ratio: str = "3:4",
    negative_prompt: str = "",
    image_base64_input: Optional[str] = None
) -> dict:
    """
    Step 3: Generate ultra-high-quality image using fashn.ai (4k resolution).
    """
    try:
        provider = get_fashn_provider()
        
        if not image_base64_input:
            raise ValueError("Input image is required for Fashn.ai generation")

        if not image_base64_input.startswith("http") and not image_base64_input.startswith("data:"):
            image_input = f"data:image/jpeg;base64,{image_base64_input}"
        else:
            image_input = image_base64_input

        result_data = await provider.run_product_to_model(
            product_image=image_input,
            prompt=prompt,
            negative_prompt=negative_prompt,
            aspect_ratio=aspect_ratio,
            resolution="4k" # The key difference
        )
        
        outputs = result_data.get("output", [])
        if not outputs:
            raise ValueError("No output images returned from Fashn.ai")
            
        output_image = outputs[0]
        
        if output_image.startswith("data:image"):
            _, b64_data = output_image.split(",", 1)
        else:
            b64_data = output_image
            
        return {
            "image_base64": b64_data,
            "mime_type": "image/png",
            "model_used": "fashn-product-to-model-4k",
            "quality": "ultra"
        }
        
    except Exception as e:
        logger.error(f"Ultra quality generation failed: {str(e)}")
        raise


# ============================================
# Vertex AI Implementation (Backup)
# ============================================

async def generate_image_vertex(
    prompt: str,
    aspect_ratio: str = "3:4",
    negative_prompt: str = ""
) -> dict:
    """
    Generate image using Vertex AI (Imagen).
    Fallback method.
    """
    try:
        model = get_vertex_model()
        if not model:
            raise ValueError("Vertex AI model not initialized")

        logger.info(f"Generating fallback image with Vertex AI... Prompt: {prompt[:50]}...")
        
        # Calculate aspect ratio string for Vertex
        # Imagen supports: "1:1", "3:4", "4:3", "9:16", "16:9"
        
        response = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio=aspect_ratio,
            negative_prompt=negative_prompt,
            safety_filter_level="block_some",
            person_generation="allow_adult"
        )
        
        if not response.images:
             raise ValueError("No images returned from Vertex AI")
        
        img_bytes = response.images[0]._image_bytes
        b64_data = base64.b64encode(img_bytes).decode("utf-8")
        
        return {
            "image_base64": b64_data,
            "mime_type": "image/jpeg", # Imagen usually returns JPEG or PNG, typically JPEG
            "model_used": "vertex-imagen-006",
            "quality": "standard" # Vertex doesn't strictly distinguish 1k/4k in this API the same way
        }

    except Exception as e:
        logger.error(f"Vertex AI generation failed: {str(e)}")
        raise


# ============================================
# Fallback Wrapper
# ============================================

async def generate_with_fallback(
    prompt: str,
    aspect_ratio: str = "3:4",
    negative_prompt: str = "",
    image_base64_input: Optional[str] = None,
    quality: str = "preview"
) -> dict:
    """
    Try Fashn.ai first, then fallback to Vertex AI.
    """
    # 1. Try Fashn.ai
    try:
        if quality == "ultra":
            return await generate_ultra_quality(prompt, aspect_ratio, negative_prompt, image_base64_input)
        else:
            return await generate_preview(prompt, aspect_ratio, negative_prompt, image_base64_input)
            
    except Exception as fashn_error:
        logger.warning(f"Primary provider (Fashn.ai) failed: {fashn_error}. Switching to fallback (Vertex AI)...")
        
        try:
            return await generate_image_vertex(prompt, aspect_ratio, negative_prompt)
        except Exception as vertex_error:
            logger.error(f"Fallback provider (Vertex AI) also failed: {vertex_error}")
            raise fashn_error 


# ============================================
# Combined Pipeline Function
# ============================================

async def generate_outfit_image(
    image_data: bytes,
    mime_type: str = "image/jpeg",
    product_description: str = "",
    generation_type: str = "fashion",
    quality: str = "preview",  # "preview" or "ultra"
    form_data: dict = None,
    aspect_ratio: str = "3:4"
) -> dict:
    """
    Complete pipeline: Analyze image → Generate with appropriate quality.
    """
    
    # Step 1: Analyze / Construct Prompt
    base_prompt = await analyze_outfit_image(
        image_data=image_data,
        mime_type=mime_type,
        product_description=product_description,
        generation_type=generation_type
    )
    
    # Enhance prompt with form data if provided
    if form_data:
        enhanced_prompt = _enhance_prompt_with_form_data(base_prompt, form_data, generation_type)
    else:
        enhanced_prompt = base_prompt
    
    # Convert input bytes back to base64 string for the API call
    input_b64 = base64.b64encode(image_data).decode('utf-8')
    
    # Step 2: Generate (with Fallback)
    result = await generate_with_fallback(
        prompt=enhanced_prompt,
        aspect_ratio=aspect_ratio,
        image_base64_input=input_b64,
        quality=quality
    )
    
    # Add the prompts to the result
    result["base_prompt"] = base_prompt
    result["enhanced_prompt"] = enhanced_prompt
    
    return result


def _enhance_prompt_with_form_data(base_prompt: str, form_data: dict, generation_type: str) -> str:
    """Enhance the base prompt with user's form selections."""
    
    enhancements = []
    
    if generation_type == "fashion":
        if form_data.get("gender"):
            enhancements.append(f"worn by a {form_data['gender']} model")
        if form_data.get("age"):
            enhancements.append(f"approximately {form_data['age']} years old")
        if form_data.get("ethnicity"):
            enhancements.append(f"{form_data['ethnicity']} ethnicity")
        if form_data.get("hairstyle"):
            enhancements.append(f"with {form_data['hairstyle']} hairstyle")
        if form_data.get("pose"):
            enhancements.append(f"in a {form_data['pose']} pose")
        if form_data.get("background"):
            enhancements.append(f"{form_data['background']} background")
        if form_data.get("lighting"):
            enhancements.append(f"{form_data['lighting']} lighting")
    
    elif generation_type == "jewellery":
        if form_data.get("accessoriesShotStyle"):
            enhancements.append(f"{form_data['accessoriesShotStyle']} shot style")
        if form_data.get("accessoriesBackground"):
            enhancements.append(f"{form_data['accessoriesBackground']} background")
        if form_data.get("accessoriesLighting"):
            enhancements.append(f"{form_data['accessoriesLighting']} lighting")
    
    if enhancements:
        return f"{base_prompt}. {', '.join(enhancements)}."
    
    return base_prompt
