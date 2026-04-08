# My Studio Channel - Divi 4 Conversion Guide

This document maps the React component structure to Divi 4 modules for seamless WordPress integration.

---

## Quick Start

1. **Install Divi 4** on your WordPress site
2. **Add Custom CSS**: Copy `divi-theme-vars.css` into Divi > Theme Options > Custom CSS
3. **Import Google Font**: Add Montserrat font in Divi > Theme Options > General > Typography
4. **Create pages** using the structure below

---

## Section Mapping

| React Component | Divi Section ID | Divi Modules Used |
|-----------------|-----------------|-------------------|
| `header.tsx` | `#msc-header` | Theme Header / Global Header |
| `hero-section.tsx` | `#msc-hero` | Fullwidth Header, Button, Text |
| `about-section.tsx` | `#msc-about` | Text, Blurb (4-column), Image |
| `services-section.tsx` | `#msc-services` | Text, Image, Code (for grid) |
| `own-platform-section.tsx` | `#msc-own-platform` | Text, Blurb (3 features), Image |
| `packages-section.tsx` | `#msc-packages` | Pricing Tables (3 columns) |
| `requirements-section.tsx` | `#msc-requirements` | Text, Blurb (with icons), Image |
| `demos-section.tsx` | `#msc-demos` | Gallery, Image, Text |
| `testimonials-section.tsx` | `#msc-testimonials` | Testimonial Slider |
| `built-for-creators-section.tsx` | `#msc-creators` | Blurb (grid), CTA |
| `what-you-get-section.tsx` | `#msc-benefits` | Text, Blurb (3-column) |
| `addons-section.tsx` | `#msc-addons` | Blurb (grid), Text |
| `process-section.tsx` | `#msc-process` | Text, Image (2-column) |
| `faq-section.tsx` | `#msc-faq` | Accordion |
| `policies-section.tsx` | `#msc-policies` | Blurb (grid) |
| `contact-section.tsx` | `#msc-contact` | Contact Form, Text, Map |
| `footer.tsx` | `#msc-footer` | Theme Footer / Global Footer |

---

## Color Reference

| Name | Hex | Usage |
|------|-----|-------|
| Gold (Primary Accent) | `#F5B841` | Buttons, highlights, accents |
| Background Darkest | `#191919` | Body, hero backgrounds |
| Background Dark | `#1F1F1F` | Section backgrounds |
| Background Card | `#262626` | Cards, elevated surfaces |
| Text Primary | `#F2F2F2` | Headings, main text |
| Text Secondary | `#A3A3A3` | Descriptions, muted text |
| Border | `rgba(64, 64, 64, 0.5)` | Borders, dividers |

---

## Section-by-Section Build Guide

### 1. Header (`#msc-header`)

**Divi Module:** Global Header or Theme Builder Header

**Structure:**
- Logo (left): Use MSC icon image `/images/msc-icon.png`
- Navigation (center): Primary menu with dropdowns
- CTA Button (right): "Get Started" gold button

**Settings:**
- Background: `rgba(25, 25, 25, 0.95)` with blur
- Position: Fixed
- Border bottom: 1px `var(--msc-border)`

---

### 2. Hero Section (`#msc-hero`)

**Divi Modules:** Fullwidth Header or Row with Text + Button

**Structure:**
```
Section (fullwidth, bg-image: hero.jpg)
  Row
    Column
      - Badge: "Professional Channel Platform"
      - H1: "Your Content Deserves a Real Network"
      - Paragraph: Description text
      - Button Group: "View Packages" + "Watch Demo"
```

**Settings:**
- Min-height: 100vh
- Background: Gradient overlay on image
- Padding: 120px top

---

### 3. About Section (`#msc-about`)

**Divi Modules:** Text + Blurb Grid + Image

**Structure:**
```
Section (msc-surface-1)
  Row 1 (2 columns: 60/40)
    Column 1: Badge, H2 "About My Studio Channel", H3 "What We Do", Paragraph
    Column 2: Image (what-we-do.jpg)
  Row 2 (4 columns)
    Blurb: Talk Shows
    Blurb: Cooking Shows
    Blurb: Documentary Series
    Blurb: Digital Series
```

**Blurb Settings:**
- Icon: Use Font Awesome or upload SVG
- Layout: Icon top
- Background: Glass card style

---

### 4. Services Section (`#msc-services`)

**Divi Modules:** Text + Custom HTML/Code for screenshot grid

**Structure:**
```
Section (msc-surface-0)
  Row (2 columns: 50/50)
    Column 1: H2, Paragraph, Feature list (checkmarks)
    Column 2: Image grid showing admin screenshots
```

**For Screenshot Grid:** Use Code Module with custom HTML/CSS or Gallery Module

---

### 5. Own Your Platform (`#msc-own-platform`)

**Divi Modules:** Text + Blurb + Image

**Structure:**
```
Section (msc-surface-1)
  Row (2 columns: 55/45)
    Column 1: Badge, H2 "Own Your Platform", Paragraph, 3x Blurbs (inline)
    Column 2: Image (own-platform.jpg)
```

---

### 6. Packages Section (`#msc-packages`)

**Divi Module:** Pricing Tables

**Structure:**
```
Section (msc-surface-2)
  Row 1: Badge, H2 "Channel Packages"
  Row 2 (3 columns)
    Pricing Table: Starter ($500)
    Pricing Table: Professional ($850) - Featured
    Pricing Table: Network ($1,200)
```

**Featured Package Settings:**
- Border: `#F5B841`
- Box shadow: Gold glow
- Badge: "Most Popular"

---

### 7. Requirements Section (`#msc-requirements`)

**Divi Modules:** Text + Blurb + Image

**Structure:**
```
Section (msc-surface-0)
  Row (2 columns)
    Column 1: Requirements list with icons
    Column 2: Image (podcast.jpg)
```

---

### 8. Demos Section (`#msc-demos`)

**Divi Modules:** Gallery or Image + Text cards

**Structure:**
```
Section (msc-surface-1)
  Row (2 columns: 60/40)
    Column 1: Large demo preview image
    Column 2: Stacked demo cards (clickable)
```

---

### 9. Testimonials (`#msc-testimonials`)

**Divi Module:** Testimonial or Slider

**Structure:**
```
Section (msc-surface-0)
  Row: Badge, H2
  Row: Testimonial Slider (3 slides)
```

---

### 10. Built for Creators (`#msc-creators`)

**Divi Modules:** Blurb Grid

**Structure:**
```
Section (msc-surface-1)
  Row: H2 "Built for Creators Like You"
  Row (3 columns x 2 rows): 6 Blurbs for creator types
  Row: CTA Card "Ready to Get Started?"
```

---

### 11. What You Get (`#msc-benefits`)

**Divi Modules:** Text + Blurb (with background image)

**Structure:**
```
Section (background: My-Studio-Channel.jpg with dark overlay)
  Row: H2 "What You Get"
  Row (3 columns): 3 Benefit blurbs
```

---

### 12. Add-Ons (`#msc-addons`)

**Divi Modules:** Blurb Grid

**Structure:**
```
Section (msc-surface-1)
  Row: H2 "Add-Ons & Recommendations"
  Row (2 columns x 2 rows): Add-on blurbs
  Row: Recommendations card
```

---

### 13. Process Section (`#msc-process`)

**Divi Modules:** Text + Image

**Structure:**
```
Section (msc-surface-0)
  Row (2 columns: 50/50)
    Column 1: 2 stacked images
    Column 2: H2, Paragraph, Feature list
```

---

### 14. FAQ Section (`#msc-faq`)

**Divi Module:** Accordion

**Structure:**
```
Section (msc-surface-1)
  Row: Badge, H2 "Common Inquiries"
  Row: Accordion Module (6 toggles)
```

---

### 15. Policies Section (`#msc-policies`)

**Divi Modules:** Blurb Grid

**Structure:**
```
Section (msc-surface-0)
  Row: H2 "Policies & Requirements"
  Row (2 columns x 3 rows): 6 Policy blurbs
  Row: Highlighted policy card (72-hour response)
```

---

### 16. Contact Section (`#msc-contact`)

**Divi Modules:** Contact Form + Text

**Structure:**
```
Section (background: studio-contact.jpg with overlay)
  Row (2 columns)
    Column 1: H2, Paragraph
    Column 2: Contact Form 7 or Divi Contact Form
```

---

### 17. Footer (`#msc-footer`)

**Divi Module:** Theme Builder Footer

**Structure:**
```
4-column layout:
  Column 1: Logo, tagline
  Column 2: Services links
  Column 3: Resources links  
  Column 4: Contact info
Bottom bar: Copyright
```

---

## CSS Classes Reference

Add these classes to Divi modules for consistent styling:

| Class | Purpose |
|-------|---------|
| `msc-surface-0` | Darkest section background |
| `msc-surface-1` | Dark section background |
| `msc-surface-2` | Card-level background |
| `msc-glass-card` | Glassmorphism card effect |
| `msc-bento-card` | Bento grid card style |
| `msc-badge` | Accent badge/pill style |
| `msc-text-accent` | Gold text color |
| `msc-glow` | Gold glow effect |
| `msc-btn-outline` | Outline button variant |
| `msc-image-overlay` | Dark gradient overlay on images |
| `msc-animate-fade-up` | Fade up animation |

---

## Image Assets

All images are located in `/images/`:

- `msc-icon.png` - Logo icon
- `hero.jpg` - Hero background
- `what-we-do.jpg` - About section
- `see-what-channel.jpg` - Channel preview
- `own-platform.jpg` - Platform section
- `podcast.jpg` - Requirements section
- `creator-in-mind.jpg` - Process section
- `msc-background.jpg` - What You Get background
- `on-air-bg.jpg` - CTA section background
- `demo-*.jpg` - Demo thumbnails
- `testimonial-*.jpg` - Testimonial avatars

---

## Typography Settings

**Divi Theme Options > Typography:**

- Body Font: Montserrat
- Header Font: Montserrat
- Body Size: 16px
- Header Size: Auto (use responsive scaling)
- Line Height: 1.6 for body, 1.2 for headers

---

## Responsive Breakpoints

Divi default breakpoints work well:
- Desktop: 981px+
- Tablet: 768px - 980px
- Mobile: Below 767px

Adjust section padding for mobile:
- Section padding: 3rem (mobile) vs 6rem (desktop)
- Container padding: 1rem (mobile) vs 1.5rem (desktop)

---

## Plugin Recommendations

- **WPForms** or **Contact Form 7** - Contact forms
- **Slider Revolution** - Hero animations (optional)
- **WP Rocket** - Performance optimization
- **Imagify** - Image optimization
- **ACF Pro** - Custom fields for testimonials

---

## Export Checklist

Before converting to Divi:

- [ ] Export all images from `/public/images/`
- [ ] Copy `divi-theme-vars.css` content
- [ ] Note all section IDs and data attributes
- [ ] Document any custom animations
- [ ] List all form fields needed
- [ ] Prepare testimonial content
- [ ] Prepare FAQ content
- [ ] Prepare pricing content
