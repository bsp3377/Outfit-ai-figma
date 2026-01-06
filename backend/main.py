"""
VirtualOutfit AI - FastAPI Backend Server

This is the main API server that exposes the 3-step image generation pipeline
to the React frontend.

Endpoints:
- POST /api/analyze - Step 1: Vision analysis/Prompt creation
- POST /api/generate/preview - Step 2: Preview generation (fashn.ai 1k)
- POST /api/generate/ultra - Step 3: Ultra quality (fashn.ai 4k)
- POST /api/generate - Combined pipeline (analyze + generate)
"""

import os
import base64
import logging
from typing import Optional
from io import BytesIO

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from image_pipeline import (
    analyze_outfit_image,
    generate_preview,
    generate_ultra_quality,
    generate_outfit_image,
    initialize_services
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="VirtualOutfit AI Backend",
    description="Cost-optimized 3-step AI image generation pipeline",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://virtualoutfit.ai",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Request/Response Models
# ============================================

class AnalyzeRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    product_description: str = ""
    generation_type: str = "fashion"  # fashion, jewellery, flatlay


class AnalyzeResponse(BaseModel):
    prompt: str
    model_used: str


class GenerateRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "3:4"
    negative_prompt: str = ""
    image_base64: Optional[str] = None # Added for fashn.ai support


class GenerateResponse(BaseModel):
    image_base64: str
    mime_type: str
    model_used: str
    quality: str


class FullGenerateRequest(BaseModel):
    image_base64: str
    mime_type: str = "image/jpeg"
    product_description: str = ""
    generation_type: str = "fashion"
    quality: str = "preview"  # preview or ultra
    aspect_ratio: str = "3:4"
    form_data: Optional[dict] = None


class FullGenerateResponse(BaseModel):
    image_base64: str
    mime_type: str
    model_used: str
    quality: str
    base_prompt: str
    enhanced_prompt: str


# ============================================
# Health Check
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "virtualoutfit-ai-backend"}


# ============================================
# Step 1: Vision Analysis Endpoint
# ============================================

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_image(request: AnalyzeRequest):
    """
    Step 1: Analyze product image (Simplified).
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_base64)
        
        # Analyze the image
        prompt = await analyze_outfit_image(
            image_data=image_data,
            mime_type=request.mime_type,
            product_description=request.product_description,
            generation_type=request.generation_type
        )
        
        return AnalyzeResponse(
            prompt=prompt,
            model_used="template-based-v1"
        )
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Step 2: Preview Generation Endpoint
# ============================================

@app.post("/api/generate/preview", response_model=GenerateResponse)
async def generate_preview_image(request: GenerateRequest):
    """
    Step 2: Generate preview image using Fashn.ai (1k).
    
    Requires 'image_base64' in request now.
    """
    try:
        result = await generate_preview(
            prompt=request.prompt,
            aspect_ratio=request.aspect_ratio,
            negative_prompt=request.negative_prompt,
            image_base64_input=request.image_base64
        )
        
        return GenerateResponse(**result)
        
    except Exception as e:
        logger.error(f"Preview generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Step 3: Ultra Quality Generation Endpoint
# ============================================

@app.post("/api/generate/ultra", response_model=GenerateResponse)
async def generate_ultra_image(request: GenerateRequest):
    """
    Step 3: Generate ultra-quality image using Fashn.ai (4k).
    """
    try:
        result = await generate_ultra_quality(
            prompt=request.prompt,
            aspect_ratio=request.aspect_ratio,
            negative_prompt=request.negative_prompt,
            image_base64_input=request.image_base64
        )
        
        return GenerateResponse(**result)
        
    except Exception as e:
        logger.error(f"Ultra generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Combined Pipeline Endpoint
# ============================================

@app.post("/api/generate", response_model=FullGenerateResponse)
async def generate_full_pipeline(request: FullGenerateRequest):
    """
    Combined pipeline: Analyze → Generate in one call.
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_base64)
        
        # Run the full pipeline
        result = await generate_outfit_image(
            image_data=image_data,
            mime_type=request.mime_type,
            product_description=request.product_description,
            generation_type=request.generation_type,
            quality=request.quality,
            form_data=request.form_data,
            aspect_ratio=request.aspect_ratio
        )
        
        return FullGenerateResponse(**result)
        
    except Exception as e:
        logger.error(f"Full pipeline failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# File Upload Endpoint (Alternative)
# ============================================

@app.post("/api/generate/upload")
async def generate_from_upload(
    file: UploadFile = File(...),
    product_description: str = Form(""),
    generation_type: str = Form("fashion"),
    quality: str = Form("preview"),
    aspect_ratio: str = Form("3:4"),
):
    """
    Generate image from uploaded file.
    """
    try:
        # Read the uploaded file
        image_data = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        # Run the pipeline
        result = await generate_outfit_image(
            image_data=image_data,
            mime_type=mime_type,
            product_description=product_description,
            generation_type=generation_type,
            quality=quality,
            aspect_ratio=aspect_ratio
        )
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Upload generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Startup Event
# ============================================

@app.on_event("startup")
async def startup_event():
    """Initialize backend services"""
    logger.info("Starting VirtualOutfit AI Backend...")
    initialize_services()
    logger.info("Backend ready with Fashn.ai provider and Vertex AI fallback!")


# ============================================
# Run the server
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
