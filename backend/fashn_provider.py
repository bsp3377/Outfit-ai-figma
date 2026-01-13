"""
FASHN.ai Provider - Product to Model API Integration

This module handles the FASHN.ai API for generating on-model images from product photos.
API Documentation: https://docs.fashn.ai/

The Product-to-Model endpoint generates realistic images of AI models wearing clothing
from flat-lay or ghost mannequin product photos.
"""

import os
import httpx
import asyncio
import logging
import base64
from typing import Optional, Dict, Any

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FashnProvider:
    """FASHN.ai API Provider for product-to-model image generation."""
    
    BASE_URL = "https://api.fashn.ai/v1"
    
    def __init__(self):
        self.api_key = os.getenv("FASHN_API_KEY")
        if not self.api_key:
            logger.warning("FASHN_API_KEY not found in environment variables.")
    
    async def run_product_to_model(
        self,
        product_image_url: str = None,
        product_image_base64: str = None,
        model_image_url: str = None,
        model_image_base64: str = None,
        prompt: str = "", # Added prompt
        category: str = "tops", # Deprecated but kept in signature for compatibility
        mode: str = "generate",  # 'generate' or 'try-on'
        num_samples: int = 1,
        restore_clothes: bool = False, # Deprecated
        adjust_hands: bool = False, # Deprecated
        restore_background: bool = False, # Deprecated
        garment_photo_type: str = "auto", # Deprecated
        long_top: bool = False # Deprecated
    ) -> Dict[str, Any]:
        """
        Run the Product-to-Model generation using new API format.
        """
        if not self.api_key:
            raise ValueError("FASHN_API_KEY is not configured")
        
        # Build inputs dictionary for new API schema
        inputs = {}
        
        if prompt:
            inputs["prompt"] = prompt
        
        # Add product image
        if product_image_base64:
            inputs["product_image"] = f"data:image/jpeg;base64,{product_image_base64}"
        elif product_image_url:
            inputs["product_image"] = product_image_url
        else:
            raise ValueError("Either product_image_url or product_image_base64 is required")
        
        # Add model image for try-on mode
        if mode == "try-on":
            if model_image_base64:
                inputs["model_image"] = f"data:image/jpeg;base64,{model_image_base64}"
            elif model_image_url:
                inputs["model_image"] = model_image_url
                
            # If try-on mode is clearer with a specific model name, we could switch here.
            # But we stick to product-to-model as it covers both according to docs.
        
        # Construct full payload
        payload = {
            "model_name": "product-to-model",
            "inputs": inputs
        }
        
        logger.info(f"Starting FASHN.ai Product-to-Model generation (model: product-to-model)")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/run",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=60.0
            )
            
            if response.status_code != 200:
                error_text = response.text
                logger.error(f"FASHN.ai run error: {response.status_code} - {error_text}")
                raise ValueError(f"FASHN.ai API error: {error_text}")
            
            data = response.json()
            logger.info(f"FASHN.ai job started: {data.get('id')}")
            return data
    
    async def get_status(self, prediction_id: str) -> Dict[str, Any]:
        """
        Get the status of a prediction.
        
        Args:
            prediction_id: The ID returned from run_product_to_model
        
        Returns:
            Dict with status and output images when complete
        """
        if not self.api_key:
            raise ValueError("FASHN_API_KEY is not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/status/{prediction_id}",
                headers={
                    "Authorization": f"Bearer {self.api_key}"
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                error_text = response.text
                logger.error(f"FASHN.ai status error: {response.status_code} - {error_text}")
                raise ValueError(f"FASHN.ai status error: {error_text}")
            
            return response.json()
    
    async def generate_and_wait(
        self,
        product_image_base64: str,
        prompt: str = "",
        category: str = "tops",
        mode: str = "generate",
        timeout_seconds: int = 120,
        poll_interval: int = 3
    ) -> Dict[str, Any]:
        """
        Generate image and wait for completion.
        """
        # Start the generation
        result = await self.run_product_to_model(
            product_image_base64=product_image_base64,
            prompt=prompt,
            category=category,
            mode=mode
        )
        
        prediction_id = result.get("id")
        if not prediction_id:
            raise ValueError("No prediction ID returned from FASHN.ai")
        
        logger.info(f"Waiting for FASHN.ai generation to complete (ID: {prediction_id})")
        
        # Poll for completion
        elapsed = 0
        while elapsed < timeout_seconds:
            status = await self.get_status(prediction_id)
            state = status.get("status")
            
            if state == "completed":
                logger.info("FASHN.ai generation completed successfully")
                return status
            elif state == "failed":
                error_msg = status.get("error", "Unknown error")
                logger.error(f"FASHN.ai generation failed: {error_msg}")
                raise ValueError(f"FASHN.ai generation failed: {error_msg}")
            
            logger.info(f"FASHN.ai status: {state}, waiting...")
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval
        
        raise TimeoutError(f"FASHN.ai generation timed out after {timeout_seconds} seconds")


# Singleton instance
_fashn_provider: Optional[FashnProvider] = None


def get_fashn_provider() -> FashnProvider:
    """Get or create the FASHN provider instance."""
    global _fashn_provider
    if _fashn_provider is None:
        _fashn_provider = FashnProvider()
    return _fashn_provider
