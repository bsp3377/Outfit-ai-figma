# Outfit AI Generator

**Outfit AI** is a cutting-edge, AI-powered image generation platform tailored for e-commerce brands, photographers, and content creators. It dramatically reduces the cost and time of professional product photography by generating studio-quality results instantly.

---

## 📖 Application Guide

This application is divided into public marketing pages and a secure, feature-rich dashboard.

### 🌐 Public Pages

#### 1. Landing Page (Home)
*   **Hero Section**: Clear value proposition with "Start Free" CTA and side-by-side comparisons.
*   **Before/After Sliders**: Interactive demonstration of the AI's capabilities across Fashion, Jewellery, Footwear, and Accessories.
*   **Feature Grid**: Highlights key capabilities like Fashion Model replacement, Macro Close-ups, and Flatlay composition.
*   **Social Proof**: Testimonials from e-commerce leaders (StyleCo, LuxeGems).

#### 2. How It Works
*   **Video Tutorials**: A curated library of tutorials covering "Getting Started," "Advanced Model Selection," and "Flatlay Tips."
*   **Step-by-Step Guide**: Visual breakdown of the 3-step process: Upload -> Choose Style -> Generate.
*   **FAQ**: Common questions about file formats, speed, and trial limits.

#### 3. Pricing & Plans
*   **Tiered Plans**:
    *   **Free Trial**: 10 generations to test the waters.
    *   **Pro (₹999/mo)**: 100 generations, priority speed, auto-save, and commercial rights.
    *   **Corporate**: Custom solutions for high-volume enterprise needs.
*   **Comparison Table**: Detailed feature-by-feature breakdown of all plans.

---

### ⚡ Dashboard (Authenticated)

#### 1. Generator Hub (The Core)
The primary workspace for creating images.
*   **Three Specialized Modes**:
    *   **Apparel**: For clothing on human models including detailed pose and ethnicity controls.
    *   **Accessories**: optimized macros for jewellery, bags, and shoes.
    *   **Creative**: For styling flatlays and artistic product compositions.
*   **Advanced Controls**:
    *   **Color Picker**: Select exact HEX backgrounds or create custom gradients (Linear/Radial).
    *   **Prompt Engineering**: Under-the-hood logic translates UI selections into complex AI prompts.
    *   **Magic Upload**: Drag-and-drop interface supporting multiple files.
*   **Results View**:
    *   Real-time generation status.
    *   **Action Overlay**: Download, Like, Delete, or "Use as Reference" directly from the image card.

#### 2. Library (Asset Management)
*   **Smart Filtering**: Filter by category (Fashion/Jewellery/Flatlay) or "Liked" status.
*   **Layout Options**: Toggle between Grid and List views.
*   **Search**: Instantly find past generations by keyword.
*   **Management**: Bulk delete or download your assets.

#### 3. Billing & Credits
*   **Credit Tracking**: Visual progress bar showing monthly credit usage.
*   **Plan Management**: Upgrade/downgrade plans or purchase top-up "Credit Packs".
*   **Transaction History**: View past payments and download invoices.

#### 4. Account Settings
*   **Profile**: Update name and email.
*   **Security**: Change password.
*   **Appearance**: Toggle between Light and Dark themes.
---

## 🛠️ Database Schema (Supabase SQL)

Run the following SQL in your **Supabase SQL Editor** to set up all necessary tables, security policies, and automation.

### 1. Profiles (User Data)
Automatically creates a profile when a new user signs up.

```sql
-- Create a table for public user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Also initialize user credits
  INSERT INTO public.user_credits (user_id, credits_remaining, plan_tier)
  VALUES (new.id, 10, 'free');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Generated Images
Stores your AI generation history.

```sql
CREATE TABLE generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL, -- Currently stores Data URL, can change to Storage URL
  generation_type TEXT CHECK (generation_type IN ('fashion', 'jewellery', 'flatlay')),
  prompt_used TEXT,
  is_liked BOOLEAN DEFAULT false,
  is_auto_saved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images" ON generated_images 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON generated_images 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON generated_images 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON generated_images 
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. User Credits & Plans
Manages billing limits and subscription status.

```sql
CREATE TABLE user_credits (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  credits_remaining INT DEFAULT 10,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'corporate')),
  renewal_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" ON user_credits 
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role (backend) should update credits, but for MVP we allow read.
```

### 4. Transactions (Optional for MVP)
Logs user purchases and credit top-ups.

```sql
CREATE TABLE user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount TEXT, -- e.g. "₹999"
  credits_added INT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON user_transactions 
  FOR SELECT USING (auth.uid() = user_id);
```

---
