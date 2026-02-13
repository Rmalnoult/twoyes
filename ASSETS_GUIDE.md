# TwoYes - App Assets Guide

This guide describes all visual assets needed for the app store launch.

## App Icon Design

### Concept
The TwoYes app icon should communicate:
- **Partnership**: Two people finding agreement
- **Love**: Baby naming is an act of love
- **Simplicity**: Clean, modern, approachable

### Design Specifications

**Icon Style:**
- Minimal, modern design
- Two overlapping hearts or two checkmarks
- Primary color: #ea546c (primary pink/red)
- Secondary color: #0ba5e9 (secondary blue)

**Suggested Design:**
```
Option 1: Two Hearts
- Two hearts slightly overlapping
- Left heart: #ea546c (pink)
- Right heart: #0ba5e9 (blue)
- Overlap creates a gradient blend
- White background with subtle shadow

Option 2: Double Checkmark
- Two checkmarks forming "✓✓"
- Gradient from pink to blue
- Rounded, friendly style
- White or light background

Option 3: "TY" Monogram
- Stylized "T" and "Y" letters
- Overlapping or connected
- Pink and blue gradient
- Modern, rounded font
```

### Required Sizes

**iOS:**
- App Icon: 1024x1024px (required for App Store)
- Various sizes generated automatically by Expo

**Android:**
- Adaptive Icon (Foreground): 1024x1024px
- Background color: #ea546c

**Web:**
- Favicon: 48x48px

## Splash Screen

### Design
- Background: #ea546c (primary pink)
- Icon: White version of app icon
- Size: 1284x2778px (iPhone 14 Pro Max)

### Implementation
Already configured in `app.json`:
```json
{
  "splash": {
    "image": "./assets/splash-icon.png",
    "resizeMode": "contain",
    "backgroundColor": "#ea546c"
  }
}
```

## App Store Screenshots

### Required Screenshots

**iOS (iPhone 6.7"):**
1. Welcome Screen - Show onboarding flow
2. Discover Screen - Show "For You" AI recommendations
3. Swipe Screen - Show card interface with like/dislike
4. Match Screen - Show celebration when both partners match
5. Favorites Screen - Show saved names list

**iOS (iPad Pro 12.9"):**
- Same 5 screenshots, landscape orientation

**Android:**
- Same content as iOS
- Sizes: Phone (1080x1920), 7" Tablet (1200x1920), 10" Tablet (1536x2048)

### Screenshot Recommendations

1. **Welcome Screen**
   - Show onboarding with preference selection
   - Highlight "AI-Powered Recommendations"
   - Text overlay: "Find the Perfect Name Together"

2. **Discover Screen**
   - Show "For You" section with AI badge
   - Display trending names
   - Text overlay: "Personalized AI Recommendations"

3. **Swipe Screen**
   - Show name card with swipe buttons
   - Arrows or hands showing swipe gesture
   - Text overlay: "Swipe to Find Your Favorites"

4. **Match Screen**
   - Show match celebration alert
   - Display matched name prominently
   - Text overlay: "Get Notified When You Both Match"

5. **Favorites Screen**
   - Show list of saved names
   - Partner connection indicator
   - Text overlay: "Save and Share with Your Partner"

### Screenshot Tools
- Use iOS Simulator: `xcrun simctl io booted screenshot screenshot.png`
- Use Android Emulator: `adb shell screencap -p /sdcard/screenshot.png`
- Edit with: Figma, Sketch, or Screenshot Creator tools

## App Store Listing

### App Name
**TwoYes** (max 30 characters)

### Subtitle (iOS)
"AI Baby Name Discovery" (max 30 characters)

### Short Description (Android)
"Find the perfect baby name together with AI-powered recommendations and partner matching"
(max 80 characters)

### Full Description

```
TwoYes makes baby naming fun and easy. Discover names you and your partner both love with AI-powered recommendations and Tinder-style swiping.

✨ KEY FEATURES

🤖 AI-Powered Recommendations
Get personalized name suggestions based on your preferences and favorites

💑 Partner Collaboration
Connect with your partner and get notified when you both like a name

❤️ Smart Matching
Swipe through names independently - matches appear when you both say yes

📚 Rich Name Database
30,000+ names with meanings, origins, popularity, and famous namesakes

🎯 Advanced Filters
Filter by gender, origin, popularity, syllables, and more

⭐ Save Favorites
Keep a list of your favorite names with personal notes

👑 PREMIUM FEATURES

• Unlimited AI recommendations
• Unlimited favorites
• Advanced filters
• Name pronunciation audio
• Priority support

🔒 PRIVACY & SECURITY

• End-to-end encrypted matching
• No ads, ever
• Your data stays private
• GDPR compliant

Perfect for expecting parents, name enthusiasts, and anyone looking for the perfect baby name!

---

Free to download. Premium subscription optional.
Terms: https://twoyes.app/terms
Privacy: https://twoyes.app/privacy
```

### Keywords (iOS, max 100 characters)
```
baby names,pregnancy,expecting,parents,ai,partner,matching,swipe,name finder,baby
```

### Keywords (Android)
```
baby names, baby name generator, pregnancy app, expecting parents, name meanings, popular names, unique names, partner app, name matcher
```

### App Category
- **Primary:** Health & Fitness > Pregnancy & Parenting
- **Secondary:** Lifestyle

### Age Rating
- 4+ (No objectionable content)

### Support URL
https://twoyes.app/support

### Privacy Policy URL
https://twoyes.app/privacy

## Preview Video (Optional but Recommended)

### Script (15-30 seconds)
1. Show onboarding (2s)
2. Swipe through names (5s)
3. Get AI recommendations (3s)
4. Show match notification (3s)
5. View favorites list (2s)
6. End with logo and tagline

### Specifications
- Format: .mov or .mp4
- Resolution: 1080x1920 (portrait)
- Duration: 15-30 seconds
- File size: < 500MB

## Asset Checklist

### Design Assets
- [ ] App Icon 1024x1024px
- [ ] Splash Screen Icon
- [ ] Adaptive Icon (Android)
- [ ] Favicon

### Screenshots
- [ ] 5 iPhone 6.7" screenshots
- [ ] 5 iPad Pro 12.9" screenshots
- [ ] 3 Android Phone screenshots
- [ ] 3 Android Tablet screenshots

### Store Listing
- [ ] App name
- [ ] Subtitle/short description
- [ ] Full description
- [ ] Keywords
- [ ] Screenshots with captions
- [ ] Preview video (optional)
- [ ] Support URL
- [ ] Privacy Policy URL

### Legal
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] GDPR compliance docs
- [ ] CCPA compliance docs

## Tools & Resources

### Design Tools
- **Figma**: Free, browser-based design tool
- **Canva**: Quick graphics and social media assets
- **App Icon Generator**: Many free online tools

### Screenshot Tools
- **Screenshots.pro**: Automated screenshot generator
- **AppLaunchpad**: Template-based screenshot creator
- **Previewed**: Device mockup generator

### Asset Generators
- **MakeAppIcon**: Generate all icon sizes
- **AppIcon.co**: iOS and Android icons
- **Expo**: Built-in asset generation

## Color Palette Reference

```
Primary Pink:   #ea546c
Primary Dark:   #d5294d
Secondary Blue: #0ba5e9
Secondary Dark: #0086c9
Success Green:  #10b981
Warning Amber:  #f59e0b
Error Red:      #ef4444
Gray 50:        #f9fafb
Gray 900:       #111827
White:          #ffffff
```

## Typography

- **Headings**: System (SF Pro on iOS, Roboto on Android)
- **Body**: System Default
- **Weight**: 400 (Regular), 600 (Semibold), 700 (Bold)

## Next Steps

1. **Create App Icon**
   - Use design tool (Figma/Sketch)
   - Export 1024x1024px PNG
   - Generate all sizes with `npx expo-icon`

2. **Create Splash Screen**
   - Design 1284x2778px image
   - Export PNG with transparency
   - Update `app.json`

3. **Capture Screenshots**
   - Build app in dev mode
   - Use simulator/emulator
   - Capture all required screens
   - Add captions and highlights

4. **Write Store Listing**
   - Draft descriptions
   - Gather keywords
   - Prepare promotional text

5. **Submit for Review**
   - Upload assets to App Store Connect
   - Upload to Google Play Console
   - Submit for review
