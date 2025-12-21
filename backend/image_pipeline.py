"""
VirtualOutfit AI - Cost-Optimized Image Generation Pipeline

This module implements a 3-step pipeline for generating AI fashion photography:
1. Vision Analysis (Gemini Flash) - Cheap text generation from image
2. Preview Generation (Imagen Fast) - Low-cost image preview
3. Ultra Quality Generation (Imagen Ultra) - High-quality final output

Cost Optimization Strategy:
- Step 1: ~$0.0001 per request (text only)
- Step 2: ~$0.02 per image (fast model)
- Step 3: ~$0.08 per image (ultra model, only on HD download)
"""

import os
import base64
import logging
from typing import Optional
from io import BytesIO

import vertexai
from vertexai.generative_models import GenerativeModel, Part, Image
from vertexai.preview.vision_models import ImageGenerationModel

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Vertex AI Configuration
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "your-project-id")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

# Model names
VISION_MODEL = "gemini-2.0-flash-exp"  # Fast, cheap vision analysis
PREVIEW_MODEL = "imagen-4.0-generate-preview-05-20"  # Imagen 4 Standard
ULTRA_MODEL = "imagen-4.0-generate-preview-05-20"  # Imagen 4 Standard (same for HD)

# Initialize Vertex AI
def initialize_vertex_ai():
    """Initialize Vertex AI with project credentials"""
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    logger.info(f"Vertex AI initialized: project={PROJECT_ID}, location={LOCATION}")


# ============================================
# STEP 1: Vision Analysis (The "Eye")
# ============================================

async def analyze_outfit_image(
    image_data: bytes,
    mime_type: str = "image/jpeg",
    product_description: str = "",
    generation_type: str = "fashion"
) -> str:
    """
    Step 1: Analyze the uploaded product image using Gemini Flash.
    
    This is the cheapest step - uses Gemini Flash for text generation only.
    Returns a detailed prompt optimized for image generation.
    
    Args:
        image_data: Raw bytes of the uploaded image
        mime_type: MIME type of the image (image/jpeg, image/png, etc.)
        product_description: User's description of the product
        generation_type: Type of generation (fashion, jewellery, flatlay)
    
    Returns:
        A detailed text prompt for image generation
    """
    try:
        # Initialize the vision model
        model = GenerativeModel(VISION_MODEL)
        
        # Create image part from bytes
        image_part = Part.from_data(data=image_data, mime_type=mime_type)
        
        # Build the analysis prompt based on generation type
        if generation_type == "fashion":
            analysis_prompt = f"""Analyze this clothing/apparel image in detail for AI image generation.

User's description: {product_description}

Please provide a comprehensive description including:
1. **Garment Type**: What type of clothing is this (dress, jacket, shirt, pants, etc.)?
2. **Color & Pattern**: Exact colors, any patterns, prints, or textures
3. **Fabric**: What material does it appear to be (cotton, silk, denim, leather, etc.)?
4. **Style**: The fashion style (casual, formal, streetwear, bohemian, etc.)
5. **Fit**: How the garment appears to fit (slim, relaxed, oversized, tailored)
6. **Key Details**: Buttons, zippers, pockets, collar style, sleeve length, etc.
7. **Suggested Model Look**: What type of model and pose would showcase this best?

Format your response as a single, detailed prompt paragraph optimized for AI image generation.
Start directly with the description, no preamble."""

        elif generation_type == "jewellery":
            analysis_prompt = f"""Analyze this jewelry/accessory image in detail for AI image generation.

User's description: {product_description}

Please provide a comprehensive description including:
1. **Item Type**: What type of accessory (necklace, ring, watch, bracelet, earrings, etc.)?
2. **Material**: Metal type, gemstones, or other materials visible
3. **Style**: Classic, modern, bohemian, luxury, minimalist, etc.
4. **Size & Proportion**: Relative size and how it would look when worn
5. **Key Details**: Clasps, settings, engravings, chain style, etc.
6. **Finish**: Polished, matte, textured, hammered, etc.
7. **Suggested Presentation**: How to best showcase this piece on a model

Format your response as a single, detailed prompt paragraph optimized for AI image generation.
Start directly with the description, no preamble."""

        else:  # flatlay / creative
            analysis_prompt = f"""Analyze this product image in detail for AI product photography.

User's description: {product_description}

Please provide a comprehensive description including:
1. **Product Type**: What is this product?
2. **Colors & Textures**: All colors and surface textures visible
3. **Materials**: What materials is it made of?
4. **Shape & Form**: The overall shape and any distinctive features
5. **Details**: Any logos, labels, buttons, or decorative elements
6. **Suggested Styling**: Props and background that would complement it
7. **Photography Angle**: Best angle to showcase this product

Format your response as a single, detailed prompt paragraph optimized for AI image generation.
Start directly with the description, no preamble."""

        # Generate the analysis
        response = model.generate_content([image_part, analysis_prompt])
        
        analyzed_prompt = response.text.strip()
        logger.info(f"Vision analysis complete: {len(analyzed_prompt)} characters")
        
        return analyzed_prompt
        
    except Exception as e:
        logger.error(f"Vision analysis failed: {str(e)}")
        # Fallback to user's description if analysis fails
        return product_description or "A fashion product photo"


# ============================================
# STEP 2: Preview Generation (The "Draft")
# ============================================

async def generate_preview(
    prompt: str,
    aspect_ratio: str = "3:4",
    negative_prompt: str = ""
) -> dict:
    """
    Step 2: Generate a preview image using Imagen Fast model.
    
    This is the medium-cost step - used for "Try On" button.
    Fast generation with good quality for previewing poses.
    
    Args:
        prompt: The image generation prompt (from Step 1 or user-enhanced)
        aspect_ratio: Output aspect ratio (default 3:4 for portraits)
        negative_prompt: Things to avoid in the image
    
    Returns:
        dict with 'image_base64' and 'mime_type'
    """
    try:
        # Initialize the preview model
        model = ImageGenerationModel.from_pretrained(PREVIEW_MODEL)
        
        # Default negative prompt for quality control
        if not negative_prompt:
            negative_prompt = (
                "blurry, low quality, distorted, deformed, ugly, bad anatomy, "
                "bad proportions, watermark, text, logo on clothing, "
                "studio equipment, lighting rigs, softboxes, cameras visible"
            )
        
        # Generate the preview image
        images = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio=aspect_ratio,
            negative_prompt=negative_prompt,
            add_watermark=False,
            safety_filter_level="block_some",
            person_generation="allow_adult",
        )
        
        if not images or len(images) == 0:
            raise ValueError("No images generated")
        
        # Get the first image
        generated_image = images[0]
        
        # Convert to base64
        image_bytes = generated_image._image_bytes
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        logger.info(f"Preview generated successfully: {len(image_bytes)} bytes")
        
        return {
            "image_base64": image_base64,
            "mime_type": "image/png",
            "model_used": PREVIEW_MODEL,
            "quality": "preview"
        }
        
    except Exception as e:
        logger.error(f"Preview generation failed: {str(e)}")
        raise


# ============================================
# STEP 3: Ultra Quality Generation (The "Final")
# ============================================

async def generate_ultra_quality(
    prompt: str,
    aspect_ratio: str = "3:4",
    negative_prompt: str = ""
) -> dict:
    """
    Step 3: Generate ultra-high-quality image using Imagen Ultra model.
    
    This is the premium step - only triggered on "Download HD" button.
    Maximum quality for final deliverables.
    
    Args:
        prompt: The image generation prompt
        aspect_ratio: Output aspect ratio
        negative_prompt: Things to avoid in the image
    
    Returns:
        dict with 'image_base64' and 'mime_type'
    """
    try:
        # Initialize the ultra model
        model = ImageGenerationModel.from_pretrained(ULTRA_MODEL)
        
        # Enhanced negative prompt for ultra quality
        if not negative_prompt:
            negative_prompt = (
                "blurry, low quality, distorted, deformed, ugly, bad anatomy, "
                "bad proportions, watermark, text, logo on clothing, "
                "studio equipment, lighting rigs, cameras, softboxes, "
                "artificial looking, plastic skin, oversaturated"
            )
        
        # Enhance the prompt for ultra quality
        enhanced_prompt = f"{prompt} Ultra-high resolution, 8K quality, professional photography, magazine-quality retouching, perfect lighting."
        
        # Generate the ultra quality image
        images = model.generate_images(
            prompt=enhanced_prompt,
            number_of_images=1,
            aspect_ratio=aspect_ratio,
            negative_prompt=negative_prompt,
            add_watermark=False,
            safety_filter_level="block_some",
            person_generation="allow_adult",
        )
        
        if not images or len(images) == 0:
            raise ValueError("No images generated")
        
        # Get the first image
        generated_image = images[0]
        
        # Convert to base64
        image_bytes = generated_image._image_bytes
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        logger.info(f"Ultra quality generated successfully: {len(image_bytes)} bytes")
        
        return {
            "image_base64": image_base64,
            "mime_type": "image/png",
            "model_used": ULTRA_MODEL,
            "quality": "ultra"
        }
        
    except Exception as e:
        logger.error(f"Ultra quality generation failed: {str(e)}")
        raise


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
    
    Args:
        image_data: Raw bytes of the uploaded product image
        mime_type: MIME type of the image
        product_description: User's description
        generation_type: Type of generation (fashion, jewellery, flatlay)
        quality: Output quality ("preview" for Try On, "ultra" for Download HD)
        form_data: Additional form settings (pose, background, etc.)
        aspect_ratio: Output aspect ratio
    
    Returns:
        dict with generated image data and metadata
    """
    
    # Step 1: Analyze the image to create an optimized prompt
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
    
    # Step 2 or 3: Generate based on quality level
    if quality == "ultra":
        result = await generate_ultra_quality(
            prompt=enhanced_prompt,
            aspect_ratio=aspect_ratio
        )
    else:
        result = await generate_preview(
            prompt=enhanced_prompt,
            aspect_ratio=aspect_ratio
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
        return f"{base_prompt}. {', '.join(enhancements)}. Professional e-commerce photography."
    
    return base_prompt


# Initialize on module load
initialize_vertex_ai()
