# 🎨 Outfit AI Studio

<div align="center">

![Outfit AI Studio](https://img.shields.io/badge/Outfit_AI-Studio-7c3aed?style=for-the-badge&logo=sparkles)
[![Live](https://img.shields.io/badge/Live-outfitai.studio-00C853?style=flat-square&logo=vercel)](https://outfitai.studio)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.0-119EFF?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**AI-Powered E-commerce Photography Platform**

*Transform product photos into stunning, studio-quality images with AI-generated models, backgrounds, and professional styling.*

[🌐 Live Demo](https://outfitai.studio) • [📖 Documentation](#-getting-started) • [🐛 Report Bug](https://github.com/bsp3377/Outfit-ai-figma/issues) • [✨ Request Feature](https://github.com/bsp3377/Outfit-ai-figma/issues)

</div>

---

## 🚀 What is Outfit AI Studio?

**Outfit AI Studio** is a SaaS platform that revolutionizes e-commerce photography using Google's Gemini AI. Fashion brands, jewelry retailers, and e-commerce businesses can create professional-quality product images without expensive photoshoots.

### ✨ Core Capabilities

| Module | Description |
|--------|-------------|
| **👗 Fashion Photography** | Generate realistic AI models wearing your apparel with customizable poses, hairstyles, ethnicities, and backgrounds |
| **💎 Jewelry & Accessories** | Create elegant product shots with AI models showcasing watches, necklaces, sunglasses, and more |
| **📸 Creative Flatlay** | Design beautiful product compositions with professional lighting and styling |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Component Library |
| Vite | 6.3.5 | Build Tool & Dev Server |
| TypeScript | 5.9 | Type-Safe Development |
| Tailwind CSS | 4.x | Utility-First Styling |
| Radix UI | Latest | 48+ Accessible UI Primitives |
| Lucide React | 0.487.0 | Icon Library |

### Mobile (Cross-Platform)
| Technology | Version | Purpose |
|------------|---------|---------|
| Capacitor | 8.0 | Native iOS & Android Apps |
| @capacitor/camera | 8.0 | Native Camera Access |
| @capacitor/share | 8.0 | Native Share Sheet |
| @capacitor/splash-screen | 8.0 | Native Splash Screens |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| Supabase Auth | User authentication (Email, Google, Apple OAuth) |
| Supabase Database | PostgreSQL with Row Level Security |
| Supabase Storage | Image storage for generated & uploaded assets |
| Python FastAPI | Backend image pipeline (optional self-hosted) |

### AI/ML Integration
| Technology | Purpose |
|------------|---------|
| Google Gemini 2.0 Flash | AI image generation with multimodal input |
| Custom Prompt Engineering | Optimized prompts for fashion photography |

---

## 📱 Platform Support

| Platform | Status | Details |
|----------|--------|---------|
| 🌐 **Web** | ✅ Live | [outfitai.studio](https://outfitai.studio) |
| 🤖 **Android** | ✅ Ready | Capacitor 8.0 + Native SDK |
| 🍎 **iOS** | ✅ Ready | Capacitor 8.0 + Native SDK |

---

## ⚡ Key Features

### 🎯 AI Generation
- **Multi-product upload** — Up to 5 product images per generation
- **Brand logo integration** — Subtle logo placement in backgrounds
- **Style templates** — Match specific aesthetics with inspiration images
- **HD downloads** — High-quality exports for production use

### 👤 Model Customization
- **35+ hairstyles** per gender with "Auto Select" randomization
- **15+ poses** including fashion, editorial, and casual
- **Ethnicity options** — South Asian, East Asian, Caucasian, African, Latin, Middle Eastern
- **Age ranges** — Young Adult, Adult, Middle-aged, Senior

### 🎨 Environment Controls
- **Background presets** — Studio, Outdoor, Urban, Luxury, Botanical
- **Custom colors** — Advanced color picker for solid backgrounds
- **Lighting presets** — Softbox, Natural, Dramatic, Rim, Golden Hour
- **Camera angles** — Portrait, Wide-angle, Macro, Close-up

### 👤 User Management
- **Supabase Auth** — Secure email/password and OAuth sign-in
- **Credits system** — Free tier (10 credits), Pro & Corporate plans
- **Image library** — Save, organize, and manage generated images
- **Auto-save** — Generated images automatically saved to library

---

## 📂 Project Structure

```
Outfit-ai-figma/
├── 📁 src/
│   ├── 📁 components/          # 60 React components
│   │   ├── 📁 ui/              # 48 Radix-based UI primitives
│   │   ├── GeneratorHub.tsx    # Main AI generation interface (2500+ lines)
│   │   ├── Library.tsx         # Generated images gallery
│   │   ├── Auth.tsx            # Authentication forms
│   │   ├── AuthenticatedLayout.tsx
│   │   ├── BillingSettings.tsx
│   │   ├── AccountSettings.tsx
│   │   └── ...
│   ├── 📁 utils/
│   │   ├── gemini-api.ts       # Google Gemini AI integration
│   │   ├── backend-api.ts      # Python backend integration
│   │   ├── supabase.ts         # Supabase client config
│   │   ├── native-platform.ts  # Capacitor native features
│   │   └── useSiteContent.ts   # CMS content hooks
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles (Tailwind)
├── � android/                 # Native Android project
├── � ios/                     # Native iOS project
├── � backend/                 # Python FastAPI backend
│   ├── main.py                 # API server
│   ├── image_pipeline.py       # Image processing pipeline
│   └── requirements.txt        # Python dependencies
├── 📁 build/                   # Production build output
├── capacitor.config.ts         # Mobile app configuration
├── vite.config.ts              # Vite build configuration
├── package.json                # Dependencies & scripts
└── supabase-schema.sql         # Database schema
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI
VITE_GEMINI_API_KEY=your-gemini-api-key
```

> ⚠️ **Security**: Never commit `.env` files to version control.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0+
- **npm** or **yarn**
- **Supabase account** (free tier available)
- **Google Cloud account** with Gemini API access

### Installation

```bash
# Clone the repository
git clone https://github.com/bsp3377/Outfit-ai-figma.git
cd Outfit-ai-figma

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual keys

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 Mobile Development

### Android

```bash
# Build web app and sync with Android
npm run mobile:build

# Open in Android Studio
npm run cap:android

# Or run directly on device
npm run android:run
```

### iOS

```bash
# Build web app and sync with iOS
npm run mobile:build

# Open in Xcode
npm run cap:ios

# Or run directly on device
npm run ios:run
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run cap:sync` | Sync web build to native projects |
| `npm run cap:android` | Open Android Studio |
| `npm run cap:ios` | Open Xcode |
| `npm run mobile:build` | Build + sync for mobile |
| `npm run android:run` | Build and run on Android device |
| `npm run ios:run` | Build and run on iOS device |

---

## 🔐 Security

- ✅ API keys stored in environment variables
- ✅ Supabase Row Level Security (RLS) on all tables
- ✅ Secure OAuth authentication via Supabase Auth
- ✅ `.env` files excluded from version control

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📧 Contact

**Senthil Prabhu B** — [@bsp3377](https://github.com/bsp3377)

🌐 Website: [outfitai.studio](https://outfitai.studio)

📦 Repository: [github.com/bsp3377/Outfit-ai-figma](https://github.com/bsp3377/Outfit-ai-figma)

---

<div align="center">

Made with ❤️ by the **Outfit AI Studio** Team

</div>
