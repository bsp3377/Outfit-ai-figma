# 🎨 VirtualOutfit AI

<div align="center">

![VirtualOutfit AI](https://img.shields.io/badge/VirtualOutfit-AI-purple?style=for-the-badge&logo=sparkles)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**AI-Powered E-commerce Photography Generator**

*Transform your product photos into stunning, studio-quality images with AI-generated models, backgrounds, and professional styling.*

[Live Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## � Project Overview

**VirtualOutfit AI** is a cutting-edge SaaS platform that revolutionizes e-commerce photography by leveraging Google's Gemini AI to generate professional-quality product images. The platform enables fashion brands, jewelry retailers, and e-commerce businesses to create stunning visual content without expensive photoshoots.

### What VirtualOutfit AI Does:
- **Fashion Photography**: Generate realistic AI models wearing your apparel with customizable poses, hairstyles, ethnicities, and backgrounds
- **Jewelry/Accessories**: Create elegant product shots with AI models showcasing watches, necklaces, sunglasses, and more
- **Creative Flatlay**: Design beautiful product compositions with professional lighting and styling

---

## ✨ Key Features

### 🎯 Core Functionality
| Feature | Description |
|---------|-------------|
| **AI Image Generation** | Generate studio-quality product photos using Google Gemini 3 Pro Image model |
| **Multi-Product Upload** | Upload up to 5 product images to feature in a single generated image |
| **Brand Logo Integration** | Subtly integrate your brand logo into generated backgrounds |
| **Style Templates** | Use inspiration templates to match specific aesthetics |

### 👤 User Management
| Feature | Description |
|---------|-------------|
| **Supabase Authentication** | Secure email/password and OAuth (Google, Apple) sign-in |
| **User Profiles** | Auto-populated profile information after signup |
| **Credits System** | Free tier with 10 credits; Pro and Corporate plans available |
| **Image Library** | Save, organize, and manage generated images |

### 🎨 Customization Options
| Feature | Description |
|---------|-------------|
| **Model Customization** | Gender, age, ethnicity, 35+ hairstyles, and 15+ poses |
| **Auto-Select Mode** | Let AI randomly choose hairstyles and poses for variety |
| **Background Control** | Studio, outdoor, urban, luxury, botanical, and custom colors |
| **Lighting Presets** | Softbox, natural, dramatic, rim lighting, and more |
| **Camera Settings** | Portrait, wide-angle, macro, and custom camera looks |

### 📱 Responsive Design
| Feature | Description |
|---------|-------------|
| **Desktop Layout** | Full sidebar navigation with spacious workspace |
| **Mobile Optimized** | Bottom tab navigation with touch-friendly controls |
| **Dark Mode** | Full dark/light theme support |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI Component Library |
| **Vite** | 6.3.5 | Build Tool & Dev Server |
| **Tailwind CSS** | 4.x | Utility-First Styling |
| **Radix UI** | Latest | Accessible UI Primitives |
| **Lucide React** | 0.487.0 | Icon Library |
| **Sonner** | 2.0.3 | Toast Notifications |
| **Recharts** | 2.15.2 | Data Visualization |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Supabase Auth** | User authentication (email, Google, Apple) |
| **Supabase Database** | PostgreSQL with Row Level Security |
| **Supabase Storage** | Image storage for generated & uploaded assets |

### AI/ML Integration
| Technology | Purpose |
|------------|---------|
| **Google Gemini 3 Pro Image** | AI image generation with multimodal input |
| **Google Gemini 2.5 Flash Lite** | Text prompt generation fallback |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| **Embla Carousel** | Image carousels and galleries |
| **React Hook Form** | Form state management |
| **Motion** | Animations and transitions |
| **Vaul** | Drawer components |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ Yes |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI generation | ✅ Yes |

### Example `.env` Template:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

> ⚠️ **Important**: Never commit your `.env` file to version control. The `.gitignore` file is pre-configured to exclude it.

---

## 🏗️ Architecture & Project Structure

```
VirtualOutfit-AI/
├── 📁 src/
│   ├── 📁 assets/                 # Static images and Figma exports
│   ├── 📁 components/             # React components
│   │   ├── 📁 ui/                 # Radix-based UI primitives (48 components)
│   │   ├── � figma/              # Figma-imported components
│   │   ├── AccountSettings.tsx    # User profile & settings
│   │   ├── Auth.tsx               # Authentication forms
│   │   ├── AuthenticatedLayout.tsx # Main app layout with sidebar
│   │   ├── BillingSettings.tsx    # Subscription & payment
│   │   ├── ColorPicker.tsx        # Advanced color selection
│   │   ├── GeneratorHub.tsx       # Main AI generation interface
│   │   ├── HowItWorks.tsx         # Tutorial & documentation
│   │   ├── Library.tsx            # Generated images gallery
│   │   ├── Pricing.tsx            # Pricing plans display
│   │   └── TemplateSelector.tsx   # Inspiration template picker
│   ├── 📁 utils/
│   │   ├── gemini-api.ts          # Google Gemini AI integration
│   │   ├── supabase.ts            # Supabase client configuration
│   │   ├── useSiteContent.ts      # CMS content hooks
│   │   └── useVideoTutorials.ts   # Video tutorials hook
│   ├── 📁 styles/                 # Additional stylesheets
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global Tailwind styles
├── 📄 index.html                  # HTML entry point
├── 📄 package.json                # Dependencies & scripts
├── 📄 vite.config.ts              # Vite configuration
├── 📄 supabase-schema.sql         # Database schema & migrations
└── 📄 .env                        # Environment variables (not committed)
```

---

## 📊 Database Schema

The application uses Supabase PostgreSQL with the following tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data linked to Supabase Auth |
| `user_credits` | Subscription plans and available credits |
| `generated_images` | AI-generated image history |
| `uploaded_assets` | User-uploaded products, logos, templates |
| `generation_settings` | Persisted generation settings per tab |
| `user_transactions` | Billing and credit purchase history |

All tables have **Row Level Security (RLS)** enabled, ensuring users can only access their own data.

---

## 📱 Responsive Design

VirtualOutfit AI features a fully responsive design optimized for both desktop and mobile experiences:

### Desktop (lg+)
- **Left Sidebar**: Persistent navigation with Generate, Library, Billing, Settings
- **Top Bar**: Logo, credits display, theme toggle, profile dropdown
- **Workspace**: Full-width generation interface with split panels

### Mobile (< lg)
- **Bottom Tab Bar**: Three-tab navigation (Generate, Library, Account)
- **Top Bar**: Compact logo and credits display
- **Touch-Optimized**: Larger touch targets and mobile-friendly forms

The layout logic is handled in `AuthenticatedLayout.tsx` using Tailwind's responsive classes (`lg:` breakpoint at 1024px).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn**
- **Supabase Account** (free tier available)
- **Google Cloud Account** with Gemini API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bsp3377/Outfit-ai-figma.git
   cd Outfit-ai-figma
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual keys
   ```

4. **Set up Supabase database**
   - Go to your Supabase project's SQL Editor
   - Run the contents of `supabase-schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

The production build will be output to the `build/` directory.

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |

---

## 🔐 Security

- All API keys are stored in environment variables
- Supabase Row Level Security protects user data
- Authentication handled by Supabase Auth with secure session management
- `.env` files are excluded from version control via `.gitignore`

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

**Senthil Prabhu B** - [@bsp3377](https://github.com/bsp3377)

Project Link: [https://github.com/bsp3377/Outfit-ai-figma](https://github.com/bsp3377/Outfit-ai-figma)

---

<div align="center">

Made with ❤️ by the VirtualOutfit AI Team

</div>
