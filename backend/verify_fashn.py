import base64
import requests
import sys
import time
import os

def verify():
    # Load image
    img_path = "../src/assets/lifestyle-jogger.png"
    if not os.path.exists(img_path):
        print(f"Image not found at {img_path}")
        return

    try:
        with open(img_path, "rb") as f:
            img_data = f.read()
            b64_img = base64.b64encode(img_data).decode("utf-8")
    except Exception as e:
        print(f"Failed to load image: {e}")
        return

    print(f"Image loaded. Size: {len(b64_img)}")

    # Test Health
    try:
        r = requests.get("http://localhost:8000/health")
        print("Health Check:", r.json())
    except Exception as e:
        print("Health check failed. Is server running?", e)
        return

    # Test Analyze
    print("\nTesting Analyze...")
    try:
        payload = {
            "image_base64": b64_img,
            "product_description": "A jogger",
            "generation_type": "fashion"
        }
        r = requests.post("http://localhost:8000/api/analyze", json=payload)
        if r.status_code == 200:
            print("Analyze Success:", r.json())
        else:
            print("Analyze Failed:", r.text)
    except Exception as e:
        print("Analyze request failed:", e)

    # Test Preview (Fashn)
    print("\nTesting Preview (Fashn)...")
    try:
        payload = {
            "prompt": "A person wearing joggers",
            "image_base64": b64_img,
            "aspect_ratio": "3:4"
        }
        print("Sending request to fashn.ai via backend (this may take a while)...")
        r = requests.post("http://localhost:8000/api/generate/preview", json=payload, timeout=60)
        if r.status_code == 200:
            resp = r.json()
            img_len = len(resp.get("image_base64", ""))
            print(f"Preview Success! Image len: {img_len}")
            print(f"Model used: {resp.get('model_used')}")
        else:
            print("Preview Failed:", r.text)
    except Exception as e:
        print("Preview request failed:", e)

if __name__ == "__main__":
    verify()
