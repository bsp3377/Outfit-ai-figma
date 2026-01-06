import os
import httpx
import time
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

class FashnProvider:
    """
    Provider for fashn.ai image generation API.
    """
    
    BASE_URL = "https://api.fashn.ai/v1"
    
    def __init__(self):
        self.api_key = os.getenv("FASHN_API_KEY")
        if not self.api_key:
            logger.warning("FASHN_API_KEY not found in environment variables.")
    
    async def run_product_to_model(
        self,
        product_image: str,
        model_image: Optional[str] = None,
        prompt: Optional[str] = None,
        negative_prompt: Optional[str] = None,
        aspect_ratio: str = "3:4",
        resolution: str = "1k",
        num_images: int = 1,
        output_format: str = "png"
    ) -> Dict[str, Any]:
        """
        Run the product-to-model generation.
        
        Args:
            product_image: URL or base64 of the product image.
            model_image: URL or base64 of the model image (optional).
            prompt: Text prompt for generation.
            negative_prompt: Text prompt for what to avoid.
            aspect_ratio: Desired aspect ratio (e.g., "3:4").
            resolution: "1k" (faster/cheaper) or "4k" (better quality).
            num_images: Number of images to generate.
            output_format: "png" or "jpeg".
            
        Returns:
            The raw API response from the status endpoint after completion.
        """
        if not self.api_key:
            raise ValueError("FASHN_API_KEY is not configured")
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # Prepare payload
        inputs = {
            "product_image": product_image,
            "output_format": output_format,
            "return_base64": True, # Always get base64 for our app
            "resolution": resolution
        }
        
        if model_image:
            inputs["model_image"] = model_image
        
        if prompt:
            inputs["prompt"] = prompt
            
        if aspect_ratio:
            inputs["aspect_ratio"] = aspect_ratio
            
        # seed is not strictly required, letting it be random usually better for variety
        # face_reference options could be added later
        
        payload = {
            "model_name": "product-to-model",
            "inputs": inputs
        }
        
        # 1. Start generation
        async with httpx.AsyncClient() as client:
            try:
                logger.info(f"Starting Fashn.ai generation (res={resolution})...")
                response = await client.post(
                    f"{self.BASE_URL}/run",
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                prediction_id = data.get("id")
                
                if not prediction_id:
                    raise ValueError(f"No prediction ID returned: {data}")
                
                logger.info(f"Fashn.ai job started: {prediction_id}")
                
            except httpx.HTTPError as e:
                logger.error(f"Fashn.ai API request failed: {str(e)}")
                if hasattr(e, 'response') and e.response:
                    logger.error(f"Response: {e.response.text}")
                raise
        
        # 2. Poll for results
        return await self._poll_status(prediction_id, headers)

    async def _poll_status(self, prediction_id: str, headers: Dict[str, str], max_attempts: int = 60) -> Dict[str, Any]:
        """Poll the status endpoint until completion or timeout."""
        
        url = f"{self.BASE_URL}/status/{prediction_id}"
        
        async with httpx.AsyncClient() as client:
            for attempt in range(max_attempts):
                try:
                    response = await client.get(url, headers=headers, timeout=10.0)
                    response.raise_for_status()
                    data = response.json()
                    
                    status = data.get("status")
                    
                    if status == "completed":
                        logger.info(f"Fashn.ai job {prediction_id} completed successfully.")
                        return data
                    
                    elif status == "failed":
                        error_msg = data.get("error", {}).get("message", "Unknown error")
                        logger.error(f"Fashn.ai job {prediction_id} failed: {error_msg}")
                        raise ValueError(f"Generation failed: {error_msg}")
                        
                    elif status == "canceled":
                        raise ValueError(f"Generation canceled: {prediction_id}")
                    
                    # Wait before next poll (backoff slightly)
                    delay = 1.0 if attempt < 5 else 2.0
                    await self._sleep(delay)
                    
                except httpx.HTTPError as e:
                    logger.warning(f"Polling error (attempt {attempt+1}): {str(e)}")
                    await self._sleep(2.0)
            
            raise TimeoutError(f"Generation timed out after {max_attempts} polls")

    async def _sleep(self, seconds: float):
        """Async sleep helper."""
        import asyncio
        await asyncio.sleep(seconds)
