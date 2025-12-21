# 📱 VirtualOutfit AI - Mobile App Assets Guide

## App Icon Specifications

### Android Icons
Place icons in `android/app/src/main/res/` folders:

| Density | Size | Path |
|---------|------|------|
| mdpi | 48x48 px | `mipmap-mdpi/ic_launcher.png` |
| hdpi | 72x72 px | `mipmap-hdpi/ic_launcher.png` |
| xhdpi | 96x96 px | `mipmap-xhdpi/ic_launcher.png` |
| xxhdpi | 144x144 px | `mipmap-xxhdpi/ic_launcher.png` |
| xxxhdpi | 192x192 px | `mipmap-xxxhdpi/ic_launcher.png` |

Also create round icons:
- `ic_launcher_round.png` (same sizes as above)

### iOS Icons
Place icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

| Size | Scale | Filename |
|------|-------|----------|
| 20pt | 2x | `icon-20@2x.png` (40x40) |
| 20pt | 3x | `icon-20@3x.png` (60x60) |
| 29pt | 2x | `icon-29@2x.png` (58x58) |
| 29pt | 3x | `icon-29@3x.png` (87x87) |
| 40pt | 2x | `icon-40@2x.png` (80x80) |
| 40pt | 3x | `icon-40@3x.png` (120x120) |
| 60pt | 2x | `icon-60@2x.png` (120x120) |
| 60pt | 3x | `icon-60@3x.png` (180x180) |
| 76pt | 1x | `icon-76.png` (76x76) |
| 76pt | 2x | `icon-76@2x.png` (152x152) |
| 83.5pt | 2x | `icon-83.5@2x.png` (167x167) |
| 1024pt | 1x | `icon-1024.png` (1024x1024) - App Store |

---

## Splash Screen Specifications

### Design Guidelines
- **Background Color**: `#0f0f0f` (dark)
- **Logo**: Centered, white/light version of VirtualOutfit AI logo
- **Logo Size**: ~200-300px width, maintaining aspect ratio
- **Style**: Minimalist, no text (just logo mark)

### Android Splash Screen
Location: `android/app/src/main/res/drawable/`

Create `splash.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashscreen_bg"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo"/>
    </item>
</layer-list>
```

Add splash logo image:
- `drawable-mdpi/splash_logo.png` (150x150)
- `drawable-hdpi/splash_logo.png` (225x225)
- `drawable-xhdpi/splash_logo.png` (300x300)
- `drawable-xxhdpi/splash_logo.png` (450x450)
- `drawable-xxxhdpi/splash_logo.png` (600x600)

### iOS Splash Screen
Edit LaunchScreen.storyboard in Xcode:
1. Open `ios/App/App.xcworkspace`
2. Select `LaunchScreen.storyboard`
3. Set background color to `#0f0f0f`
4. Add centered image with logo

---

## Color Specifications

| Color | Hex | Usage |
|-------|-----|-------|
| Primary/Brand | `#7c3aed` | Buttons, accents, highlights |
| Background Dark | `#0f0f0f` | App background, splash screen |
| Background Light | `#ffffff` | Light mode background |
| Text Primary | `#ffffff` | Main text on dark background |
| Text Secondary | `#9ca3af` | Secondary text, hints |

---

## Icon Design Requirements

### Style Guidelines
1. **Simple & Recognizable**: Icon should be clear at small sizes
2. **Consistent with Brand**: Use purple gradient or solid purple
3. **No Text**: Icons should not contain text
4. **Safe Zone**: Keep important elements within center 80%

### Recommended Design
- Purple gradient background (from `#7c3aed` to `#a855f7`)
- White/light symbol representing AI/Fashion/Outfit
- Rounded corners (iOS applies automatically, Android uses adaptive icons)

---

## Quick Commands

```bash
# Build web app
npm run build

# Sync with native projects
npm run cap:sync

# Open Android Studio
npm run cap:android

# Open Xcode
npm run cap:ios

# Build and run on Android device
npm run android:run

# Build and run on iOS simulator
npm run ios:run
```

---

## Tools for Icon Generation

- [App Icon Generator](https://appicon.co/) - Free, generates all sizes
- [MakeAppIcon](https://makeappicon.com/) - Drag & drop
- [Figma Plugin: App Icon Maker](https://www.figma.com/community/plugin/768988384946586831)
