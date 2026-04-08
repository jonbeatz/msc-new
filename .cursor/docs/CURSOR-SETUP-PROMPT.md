# My Studio Channel - WordPress/Divi 4 Complete Setup Prompt for Cursor IDE

## IMPORTANT: Read This First
I have a Next.js/React project that I need to convert to a WordPress site using Divi 4 theme builder. I'm using **Novamira MCP** to interact with my WordPress database. The complete project files are in this folder.

---

## PROJECT OVERVIEW

### Brand Identity
- **Primary Brand Color (Gold):** #F5B841
- **Background Dark:** #191919
- **Surface 1:** #222222  
- **Surface 2:** #2A2A2A
- **Card Background:** #262626
- **Text Primary:** #F2F2F2
- **Text Muted:** #A3A3A3
- **Border Color:** #404040
- **Font Family:** Montserrat (Google Fonts)

### Key Files to Reference
- `/public/divi-theme-vars.css` - Complete Divi-compatible CSS
- `/public/DIVI-CONVERSION-GUIDE.md` - Section mapping documentation
- `/public/MSC-CONTENT-EXPORT.json` - All content in JSON format
- `/app/globals.css` - Full CSS including `.msc-*` classes
- `/components/*.tsx` - React components with `data-divi-*` attributes

---

## STEP 1: WORDPRESS & DIVI INITIAL SETUP

### 1.1 Required Plugins (Install via Novamira MCP or WP Admin)
```
Using Novamira MCP, help me install these plugins:
1. Divi Theme (must be version 4.x)
2. Advanced Custom Fields Pro (ACF)
3. WP Mail SMTP (for contact form)
4. Yoast SEO
5. WP Rocket or LiteSpeed Cache (optional, for performance)
```

### 1.2 Create Divi Global Colors
Using Divi Theme Options > General > Custom CSS or Theme Customizer, set up these global colors:

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| MSC Gold | #F5B841 | Primary accent, buttons, highlights |
| MSC Dark | #191919 | Main background |
| MSC Surface 1 | #222222 | Alternate section background |
| MSC Surface 2 | #2A2A2A | Card backgrounds |
| MSC Card | #262626 | Glass card backgrounds |
| MSC Text | #F2F2F2 | Primary text |
| MSC Muted | #A3A3A3 | Secondary text |
| MSC Border | #404040 | Borders |

### 1.3 Divi Theme Options Setup
```
Navigate to Divi > Theme Options and configure:

General Settings:
- Logo: Upload /public/images/msc-icon.png
- Fixed Navigation Bar: ON
- Color Scheme: Custom (use MSC Dark #191919)

Navigation:
- Primary Nav Background: rgba(25, 25, 25, 0.92)
- Primary Nav Text Color: #F2F2F2
- Primary Nav Link Color on Hover: #F5B841
- Enable Dropdown Menu: ON
- Dropdown Menu Background: #262626
- Dropdown Menu Link Color: #F2F2F2

Layout:
- Section Height: Default
- Row Gutter Width: 3
- Website Content Width: 1280px

Typography:
- Header Font: Montserrat
- Body Font: Montserrat
- Header Text Size: Scale appropriately
- Body Text Size: 16px
- Body Line Height: 1.6em

Buttons:
- Button Font: Montserrat
- Button Text Size: 16px
- Button Text Color: #191919
- Button Background Color: #F5B841
- Button Border Radius: 12px

Footer:
- Footer Background Color: #191919
- Footer Text Color: #A3A3A3
- Footer Link Color: #F2F2F2
```

---

## STEP 2: UPLOAD ALL MEDIA ASSETS

### 2.1 Required Images (from /public/images/)
Upload these to WordPress Media Library:

```
HERO & BACKGROUNDS:
- hero-bg.jpg (Hero section background)
- on-air-bg.jpg (CTA section background)
- My-Studio-Channel.jpg (What You Get section background)

ABOUT SECTION:
- what-we-do.jpg
- see-what-channel.jpg  
- own-platform.jpg
- podcast.jpg

PROCESS SECTION:
- creator-in-mind.jpg (left image)
- creator-crew.jpg (right image)

DEMOS:
- demo-podcast.jpg
- demo-cooking.jpg
- demo-documentary.jpg
- demo-talkshow.jpg

BRANDING:
- msc-icon.png (Logo/favicon)
```

### 2.2 Engine Settings Screenshots (for Services Section Gallery)
These are the admin panel screenshots - upload all 8:
- Screenshot 2026-04-06 123304.jpg (Layout Tuning)
- Screenshot 2026-04-06 123323.jpg (Data & Migration - red)
- Screenshot 2026-04-06 123343.jpg (Data & Migration - green)
- Screenshot 2026-04-06 123438.jpg (Layout Tuning - green toggles)
- Screenshot 2026-04-06 123455.jpg (Layout Tuning - red toggles)
- Screenshot 2026-04-06 123601.jpg (System Operations)
- Screenshot 2026-04-06 123623.jpg (System Status)
- Screenshot 2026-04-06 123829.jpg (Tutorials - Videos)
- Screenshot 2026-04-06 123858.jpg (Export & Import)
- Screenshot 2026-04-06 123929.jpg (System Operations accordion)

---

## STEP 3: ADD CUSTOM CSS TO DIVI

### 3.1 Add Complete Custom CSS
Go to Divi > Theme Options > Custom CSS and paste the ENTIRE contents of `/public/divi-theme-vars.css`

This includes:
- CSS custom properties (variables)
- Glass card effects
- Bento card styles
- Gold glow effects
- Button hover states
- Section backgrounds
- Animation keyframes

### 3.2 Additional Global CSS (if not in divi-theme-vars.css)
```css
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #191919;
}
::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #505050;
}

/* Selection color */
::selection {
  background: rgba(245, 184, 65, 0.3);
  color: #F2F2F2;
}
```

---

## STEP 4: CREATE DIVI GLOBAL HEADER

### 4.1 Header Structure
Create a Global Header in Divi Theme Builder:

```
ROW 1 (Full Width):
├── Column 1 (1/4): Logo Image Module
│   - Image: msc-icon.png
│   - Max Width: 45px
│   - Link to: Homepage
│
├── Column 2 (1/2): Menu Module
│   - Menu: Primary Navigation
│   - Style: Centered
│   - Links: 
│     • About → #msc-about
│     • Services (dropdown) → 
│       - What We Do → #msc-services
│       - Own Your Platform → #msc-own-platform
│       - Packages → #msc-packages
│       - Requirements → #msc-requirements
│     • Demos → #msc-demos
│     • Resources (dropdown) →
│       - Testimonials → #msc-testimonials
│       - FAQ → #msc-faq
│     • Contact → #msc-contact
│
└── Column 3 (1/4): Button Module x2
    - Button 1: "View Demo" → #msc-demos (outline style)
    - Button 2: "Get Started" → #msc-contact (solid gold)

SECTION SETTINGS:
- Background: rgba(25, 25, 25, 0.92)
- Backdrop Filter: blur(18px)
- Position: Fixed
- Z-index: 999
- Border Bottom: 1px solid rgba(255,255,255,0.06)
```

---

## STEP 5: BUILD EACH SECTION (IN ORDER)

Reference `/public/MSC-CONTENT-EXPORT.json` for ALL text content.
Reference each `/components/*.tsx` file for structure.

### SECTION 1: HERO (#msc-hero)
**Divi Module: Fullwidth Header**

```
SECTION SETTINGS:
- CSS ID: msc-hero
- Background Image: hero-bg.jpg
- Background Overlay: linear-gradient(to bottom, rgba(25,25,25,0.7), rgba(25,25,25,0.9))
- Min Height: 100vh
- Padding: 0

CONTENT:
- Badge: "Your Own Streaming Network"
- Title: "Launch Your Own Branded Streaming Channel"
- Subtitle: "My Studio Channel helps creators build professional, network-style platforms..."
- Button 1: "Start Your Channel" → #msc-contact (gold, glow effect)
- Button 2: "View Demos" → #msc-demos (outline)

STATS ROW (3 columns):
- "Custom Branded" / "Platform"
- "Full" / "Ownership" 
- "Professional" / "Design"
```

### SECTION 2: ABOUT (#msc-about)
**Divi Modules: Text, Blurb, Image**

```
SECTION SETTINGS:
- CSS ID: msc-about
- Background: #222222
- Padding: 96px top/bottom (desktop), 64px (mobile)

ROW 1: Section Header
- Badge: "About My Studio Channel"
- Title: "What We Do"
- Subtitle paragraph

ROW 2: Two Columns
- Left: Image (what-we-do.jpg) with rounded corners
- Right: Text content + 4 Blurbs (icon boxes):
  • Podcasters - Mic icon
  • Culinary Creators - Utensils icon  
  • Filmmakers - Clapperboard icon
  • Video Creators - Video icon

ROW 3: CTA
- Title: "Ready to Build Your Channel?"
- Button: "Schedule a Consultation" → #msc-contact
```

### SECTION 3: SERVICES - See What Your Channel Could Look Like (#msc-services)
**Divi Modules: Text, Gallery, Code Module**

```
SECTION SETTINGS:
- CSS ID: msc-services
- Background: #191919
- Padding: 96px top/bottom

LEFT COLUMN (Text + List):
- Title: "See What Your Channel Could Look Like"
- Description paragraphs
- Bullet list with gold dots:
  • Network-style layout...
  • Custom video players...
  • Structured programming layout...
  • Scalable platform design...
- Note text (italic)

RIGHT COLUMN (Screenshot Gallery):
- Use Gallery Module or Code Module for grid layout
- Large featured image (2/3 width)
- 2 stacked images (1/3 width)
- 4 thumbnail row at bottom
- Add lightbox functionality
- Images: All Engine Settings screenshots
```

### SECTION 4: OWN YOUR PLATFORM (#msc-own-platform)
**Divi Modules: Text, Image, Blurb**

```
SECTION SETTINGS:
- CSS ID: msc-own-platform
- Background: #2A2A2A
- Padding: 128px top/bottom

ROW 1: Header
- Badge: "Independence & Ownership"
- Title: "Own Your Platform. Control Your Future."

ROW 2: Bento Grid Layout (use CSS Grid or Divi columns)
Create 6 cards in glass-card style:

Card 1 (Large - spans 2 cols):
- Image: own-platform.jpg
- Title: "Your Platform, Your Rules"
- Description text

Card 2:
- Icon: Globe
- Title: "Custom Domain"
- Description

Card 3:
- Icon: Lock
- Title: "Full Ownership"
- Description

Card 4:
- Icon: Star
- Title: "Professional Branding"
- Description

Card 5:
- Icon: Layers
- Title: "Scalable Infrastructure"
- Description

Card 6 (Large - spans 2 cols):
- Image: podcast.jpg
- Title: "Everything You Need"
- Description
- Button: "Explore Packages" → #msc-packages
```

### SECTION 5: PACKAGES (#msc-packages)
**Divi Module: Pricing Tables**

```
SECTION SETTINGS:
- CSS ID: msc-packages
- Background: #191919
- Padding: 96px top/bottom

HEADER:
- Badge: "Flexible Packages"
- Title: "Choose Your Package"
- Subtitle

3 PRICING TABLES:

STARTER ($1,500):
- Subtitle: "Perfect for creators just starting out"
- Features list (from JSON)
- Button: "Get Started" (outline)

PROFESSIONAL ($2,500) - FEATURED:
- Badge: "Most Popular"
- Gold border/glow
- Subtitle: "For creators ready to grow"
- Features list
- Button: "Get Started" (solid gold)

ENTERPRISE (Custom):
- Subtitle: "For established creators & networks"
- Features list
- Button: "Contact Us" → #msc-contact
```

### SECTION 6: REQUIREMENTS (#msc-requirements)
**Divi Modules: Text, Blurb, Image**

```
SECTION SETTINGS:
- CSS ID: msc-requirements
- Background: #222222
- Padding: 128px top/bottom

ROW 1: Header
- Title: "What You'll Need to Get Started"

ROW 2: Two Columns
LEFT (6 requirement cards):
1. Domain & Hosting
2. WordPress Installed
3. Divi Theme License
4. Your Content
5. Communication
6. Time Investment

RIGHT: Large text + CTA
- Title: "Ready to Begin?"
- Description
- Button: "Start Your Project" → #msc-contact
```

### SECTION 7: DEMOS (#msc-demos)
**Divi Modules: Gallery, Image, Text**

```
SECTION SETTINGS:
- CSS ID: msc-demos
- Background: #2A2A2A
- Padding: 96px top/bottom

HEADER:
- Badge: "Live Examples"
- Title: "View Demo Channels"
- Subtitle

TWO COLUMN LAYOUT:
LEFT (Featured Demo - Large):
- Full height image container
- Gradient overlay at bottom
- Demo title, category, description
- Feature tags

RIGHT (Demo Cards Stack):
4 clickable demo cards:
1. Podcast Network - demo-podcast.jpg
2. Cooking Channel - demo-cooking.jpg
3. Film Studio - demo-documentary.jpg
4. Talk Show - demo-talkshow.jpg

Each card shows:
- Thumbnail
- Title
- Category badge
- 3 feature tags
```

### SECTION 8: TESTIMONIALS (#msc-testimonials)
**Divi Module: Testimonial Slider**

```
SECTION SETTINGS:
- CSS ID: msc-testimonials
- Background: #191919
- Padding: 96px top/bottom

HEADER:
- Badge: "Creator Testimonials"
- Title: "What Creators Are Saying"

TESTIMONIAL SLIDER (3 testimonials):

1. Sarah Chen - Podcast Host, The Mindful Creative
   Quote: "My Studio Channel transformed how I present my content..."

2. Marcus Johnson - Documentary Filmmaker, Urban Stories
   Quote: "The level of customization is incredible..."

3. Elena Rodriguez - Cooking Show Host, Sabor Latino
   Quote: "I finally have a platform that matches the quality..."

SLIDER SETTINGS:
- Auto-rotate: ON
- Show arrows: ON
- Show dots: ON
- Transition: Fade
```

### SECTION 9: BUILT FOR CREATORS (#msc-creators)
**Divi Modules: Blurb, CTA**

```
SECTION SETTINGS:
- CSS ID: msc-creators
- Background: #222222
- Padding: 96px top/bottom

HEADER:
- Badge: "Made for You"
- Title: "Built for Creators Like You"

6 CREATOR TYPE CARDS (2 rows x 3):
1. Podcasters - Mic icon
2. Content Creators - Video icon
3. Coaches & Educators - GraduationCap icon
4. Filmmakers & Producers - Film icon
5. Talk Show Hosts - Users icon
6. Culinary Artists - ChefHat icon

7TH CARD (Full Width CTA):
- Title: "Ready to Join Them?"
- Description
- Button: "Start Your Journey" → #msc-contact
```

### SECTION 10: WHAT YOU GET (#msc-benefits)
**Divi Modules: Text, Blurb (with background image)**

```
SECTION SETTINGS:
- CSS ID: msc-benefits
- Background Image: My-Studio-Channel.jpg
- Background Overlay: rgba(25, 25, 25, 0.85)
- Padding: 96px top/bottom

HEADER:
- Badge: "Complete Package"
- Title: "What You Get with My Studio Channel"

3 BENEFIT CARDS (glass-card style):

1. Professional Platform
   - Icon: Tv
   - Description text

2. Full Content Control
   - Icon: Settings
   - Description text

3. Growth Ready
   - Icon: TrendingUp
   - Description text
```

### SECTION 11: ADD-ONS (#msc-addons)
**Divi Modules: Blurb, Text**

```
SECTION SETTINGS:
- CSS ID: msc-addons
- Background: #2A2A2A
- Padding: 96px top/bottom

HEADER:
- Badge: "Enhance Your Channel"
- Title: "Add-Ons & Recommendations"

LEFT SIDE - 6 ADD-ON CARDS:
1. Additional Shows (+$200/show)
2. E-commerce Integration (+$300)
3. Membership System (+$400)
4. Advanced Analytics (+$150)
5. Custom Animations (+$250)
6. Priority Support (+$100/month)

RIGHT SIDE - RECOMMENDATIONS CARD:
- Title: "Recommended Setup"
- List of recommended items with checkmarks
```

### SECTION 12: PROCESS - HOW IT WORKS (#msc-process)
**Divi Modules: Text, Blurb**

```
SECTION SETTINGS:
- CSS ID: msc-process
- Background: #222222
- Padding: 96px top/bottom

HEADER:
- Badge: "Simple Process"
- Title: "How It Works"
- Subtitle

4 STEP CARDS (numbered):

Step 1: Discovery Call
- Description text
- "1-2 days" timeline

Step 2: Design & Planning
- Description text
- "3-5 days" timeline

Step 3: Development
- Description text
- "7-14 days" timeline

Step 4: Launch & Support
- Description text
- "Ongoing" timeline
```

### SECTION 13: BUILT ON EXPERIENCE (#msc-experience)
**Divi Modules: Text, Image**

```
SECTION SETTINGS:
- CSS ID: msc-experience
- Background: #191919
- Padding: 96px top/bottom

TWO COLUMNS:

LEFT - Two Images (stacked or side-by-side):
- creator-in-mind.jpg
- creator-crew.jpg
- Both with rounded corners and slight overlap/offset

RIGHT - Text Content:
- Title: "Built on Experience, Not Guesswork"
- Multiple paragraphs about background and expertise
- Key points as bullet list or blurbs
```

### SECTION 14: FAQ (#msc-faq)
**Divi Module: Accordion**

```
SECTION SETTINGS:
- CSS ID: msc-faq
- Background: #191919
- Padding: 96px top/bottom

HEADER:
- Badge: "Have Questions?"
- Title: "Common Inquiries"

TWO COLUMN ACCORDION (or single column):

Questions (from MSC-CONTENT-EXPORT.json):
1. What exactly is My Studio Channel?
2. How is this different from YouTube or Vimeo?
3. Do I need technical skills to manage my channel?
4. How long does it take to set up my channel?
5. Can I migrate my existing content?
6. What ongoing support do you provide?
7. Do you offer payment plans?
8. Can I upgrade my package later?

ACCORDION STYLING:
- Toggle icon: Plus/Minus or Chevron
- Active state: Gold accent
- Background: #262626
- Border: #404040
```

### SECTION 15: POLICIES (#msc-policies)
**Divi Modules: Blurb**

```
SECTION SETTINGS:
- CSS ID: msc-policies
- Background: #2A2A2A
- Padding: 96px top/bottom

HEADER:
- Badge: "Before You Begin"
- Title: "Policies & Requirements"

6 POLICY CARDS (2 rows x 3):
1. Scope of Work - FileText icon
2. Revision Policy - RefreshCw icon
3. Payment Terms - CreditCard icon
4. Project Timeline - Clock icon
5. Client Responsibilities - Users icon
6. Cancellation Policy - XCircle icon

7TH CARD (Full Width - Highlighted with gold border):
- Icon: MessageCircle
- Title: "72-Hour Response Policy"
- Description text
```

### SECTION 16: CONTACT (#msc-contact)
**Divi Modules: Contact Form, Text, Map (optional)**

```
SECTION SETTINGS:
- CSS ID: msc-contact
- Background: #2A2A2A
- Padding: 96px top/bottom

TWO COLUMNS:

LEFT - Information:
- Badge: "Get In Touch"
- Title: "Ready to Start Your Channel?"
- Description
- Contact details:
  • Email: hello@mystudiochannel.com
  • Response time note
- Social links (optional)

RIGHT - Contact Form:
- Name field
- Email field
- Subject/Package Interest dropdown
- Message textarea
- Submit button (gold)

FORM SETTINGS:
- Success message
- Email notification setup
- Spam protection (reCAPTCHA)
```

### SECTION 17: READY TO START CTA (if used)
**Divi Module: CTA**

```
SECTION SETTINGS:
- CSS ID: msc-cta
- Background Image: on-air-bg.jpg
- Background Overlay: rgba(25, 25, 25, 0.8)
- Padding: 96px top/bottom

CONTENT:
- Title: "Ready to Launch Your Channel?"
- Description
- Button 1: "Start With a Consultation" → #msc-contact (gold)
- Button 2: "View Packages" → #msc-packages (outline)
```

---

## STEP 6: CREATE GLOBAL FOOTER

### Footer Structure
```
SECTION SETTINGS:
- CSS ID: msc-footer
- Background: #191919
- Border Top: 1px solid rgba(255,255,255,0.05)
- Padding: 64px top, 32px bottom

ROW 1: 4 Columns

Column 1 - Brand:
- Logo image (msc-icon.png)
- "My Studio Channel" text
- Tagline: "Professional streaming platforms for independent creators."

Column 2 - Company Links:
- Title: "Company"
- About → #msc-about
- Services → #msc-services
- Packages → #msc-packages
- Demos → #msc-demos

Column 3 - Resources Links:
- Title: "Resources"
- FAQ → #msc-faq
- Testimonials → #msc-testimonials
- Contact → #msc-contact

Column 4 - Legal Links:
- Title: "Legal"
- Privacy Policy → /privacy
- Terms of Service → /terms

ROW 2: Copyright
- Centered text: "© 2026 My Studio Channel. All rights reserved."
```

---

## STEP 7: MOBILE RESPONSIVENESS

### Test and Adjust for Each Breakpoint:
- Desktop: 1280px+
- Tablet: 768px - 1279px
- Mobile: < 768px

### Key Mobile Adjustments:
1. Header becomes hamburger menu
2. Hero text size reduces
3. Grid layouts become single column
4. Pricing tables stack vertically
5. Demo cards stack vertically
6. Reduce padding (96px → 64px → 48px)
7. Font sizes scale down appropriately

---

## STEP 8: PERFORMANCE OPTIMIZATION

### Image Optimization:
- Convert all images to WebP format
- Use responsive images (srcset)
- Lazy load below-fold images

### CSS Optimization:
- Minify custom CSS
- Remove unused Divi modules
- Enable Divi's built-in optimization

### Caching:
- Enable browser caching
- Use CDN for assets
- Enable GZIP compression

---

## STEP 9: SEO SETUP

### Yoast SEO Configuration:
- Homepage Title: "My Studio Channel | Professional Streaming Platforms for Creators"
- Homepage Meta Description: "Launch your own branded streaming channel with My Studio Channel. Professional network-style platforms for podcasters, filmmakers, and content creators."
- Open Graph image: Use hero image or branded OG image

### Schema Markup:
- Organization schema
- LocalBusiness (if applicable)
- FAQ schema for FAQ section

---

## STEP 10: FINAL CHECKLIST

Before launching, verify:

- [ ] All section IDs match navigation links (#msc-*)
- [ ] All images load properly
- [ ] Contact form submits correctly
- [ ] Mobile menu works
- [ ] Smooth scroll works
- [ ] All external links open in new tab
- [ ] No console errors
- [ ] Page speed score > 80
- [ ] All text is readable (contrast)
- [ ] Gold accents are consistent
- [ ] Glass card effects render properly
- [ ] Hover states work on all buttons
- [ ] Testimonial slider auto-rotates
- [ ] FAQ accordion opens/closes
- [ ] Gallery lightbox works

---

## NOVAMIRA MCP SPECIFIC COMMANDS

When using Novamira MCP to interact with WordPress:

### Check Existing Content:
```
Query: Get all pages
Query: Get all media items
Query: Get Divi layouts
```

### Create/Update Content:
```
Query: Create page with title "Home" and Divi builder enabled
Query: Upload media file from path
Query: Update post meta for Divi layout
```

### Useful Queries:
```
Query: Get theme options
Query: Update theme mod [name] to [value]
Query: Get menu items for menu [name]
Query: Create menu item [title] with link [url]
```

---

## TROUBLESHOOTING

### Common Issues:

1. **Glass effect not showing:**
   - Check if backdrop-filter is supported
   - Add webkit prefix
   - Ensure parent has position relative

2. **Gold glow not visible:**
   - Check box-shadow syntax
   - Ensure element is not overflow:hidden

3. **Fonts not loading:**
   - Verify Google Fonts is connected in Divi
   - Check for font-display: swap

4. **Smooth scroll not working:**
   - Add scroll-behavior: smooth to html
   - Check for conflicting JS

5. **Mobile menu issues:**
   - Check z-index conflicts
   - Verify hamburger icon is visible

---

## REFERENCE FILES IN THIS PROJECT

```
/public/
├── divi-theme-vars.css      ← Complete CSS for Divi
├── DIVI-CONVERSION-GUIDE.md ← Detailed conversion guide
├── MSC-CONTENT-EXPORT.json  ← All content as JSON
├── CURSOR-SETUP-PROMPT.md   ← This file
└── images/                   ← All image assets

/components/                  ← React components (structure reference)
/app/globals.css             ← Full CSS with .msc-* classes
```

---

**END OF CURSOR IDE SETUP PROMPT**

Use this document as your guide. Work through each section methodically, testing as you go. Reference the JSON content export for exact text, and the CSS files for styling consistency.
