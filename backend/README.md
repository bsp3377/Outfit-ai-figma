# VirtualOutfit AI - Python Backend

A cost-optimized 3-step image generation pipeline using Google Vertex AI.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Step 1        │     │   Step 2        │     │   Step 3        │
│   "The Eye"     │────▶│   "The Draft"   │────▶│   "The Final"   │
│                 │     │                 │     │                 │
│  Gemini Flash   │     │  Imagen Fast    │     │  Imagen Ultra   │
│  ~$0.0001       │     │  ~$0.02         │     │  ~$0.08         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     Vision              Preview "Try On"         "Download HD"
     Analysis            Button                   Button Only
```

## Cost Optimization

| Step | Model | Cost | When Used |
|------|-------|------|-----------|
| 1 | Gemini 2.0 Flash | ~$0.0001 | Always (vision analysis) |
| 2 | Imagen 3.0 Fast | ~$0.02 | "Try On" button |
| 3 | Imagen 3.0 Ultra | ~$0.08 | "Download HD" only |

**Typical user flow cost:**
- User tries 5 poses: 5 × $0.02 = **$0.10**
- User downloads 1 HD: 1 × $0.08 = **$0.08**
- **Total: $0.18** (vs $0.40+ with ultra for all)

## Setup

### 1. Prerequisites

- Python 3.9+
- Google Cloud Project with Vertex AI enabled
- Service account with Vertex AI permissions

### 2. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Google Cloud

```bash
# Option A: Use gcloud CLI authentication
gcloud auth application-default login

# Option B: Use service account
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### 4. Set Environment Variables

```bash
cp .env.example .env
# Edit .env with your project details
```

### 5. Run the Server

```bash
# Development
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --port 8000
```

## API Endpoints

### Health Check
```
GET /health
```

### Step 1: Analyze Image
```
POST /api/analyze
{
  "image_base64": "...",
  "mime_type": "image/jpeg",
  "product_description": "Red cotton dress",
  "generation_type": "fashion"
}
```

### Step 2: Generate Preview (Try On)
```
POST /api/generate/preview
{
  "prompt": "...",
  "aspect_ratio": "3:4",
  "negative_prompt": ""
}
```

### Step 3: Generate Ultra (Download HD)
```
POST /api/generate/ultra
{
  "prompt": "...",
  "aspect_ratio": "3:4"
}
```

### Combined Pipeline
```
POST /api/generate
{
  "image_base64": "...",
  "mime_type": "image/jpeg",
  "product_description": "Red cotton dress",
  "generation_type": "fashion",
  "quality": "preview",  // or "ultra"
  "form_data": {
    "gender": "Female",
    "pose": "standing",
    ...
  }
}
```

## Deployment

### Cloud Run (Recommended)

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/virtualoutfit-backend

# Deploy
gcloud run deploy virtualoutfit-backend \
  --image gcr.io/PROJECT_ID/virtualoutfit-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Frontend Integration

Update your frontend to call this backend:

```typescript
// src/utils/backend-api.ts
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8000';

export async function generatePreview(imageBase64: string, options: any) {
  const response = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: imageBase64,
      quality: 'preview',
      ...options
    })
  });
  return response.json();
}

export async function generateUltra(imageBase64: string, options: any) {
  const response = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: imageBase64,
      quality: 'ultra',
      ...options
    })
  });
  return response.json();
}
```
