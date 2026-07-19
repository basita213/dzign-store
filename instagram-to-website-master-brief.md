# Instagram-to-Website Generation Master Brief
### A Master Instruction Document for AI-Driven, Non-Templated Website Design

---

## 0. PURPOSE OF THIS DOCUMENT

This document is the master brief given to an AI system whenever it is asked to build a website using:
1. An Instagram profile link
2. A page logo
3. A set of post images (and captions, if available)

The goal is **not** to produce "a website." The goal is to produce **a unique, stylish, brand-accurate website every single time**, such that if this same brief is used 300 times for the same brand (or 300 different brands), no two outputs look structurally or stylistically identical. Variation is a **requirement**, not a nice-to-have.

The AI must treat every generation as a fresh creative exercise: extract the brand's real identity from the Instagram content, then express that identity through ONE of many possible design languages, layout architectures, and interaction styles — chosen deliberately, never defaulted to.

---

## 1. CORE PRINCIPLES (Read First, Apply Always)

1. **No default template.** Never fall back to "hero + 3 feature cards + testimonials + footer" as a default unless that structure is deliberately chosen from the Layout Archetypes list (Section 5) because it fits the brand.
2. **Brand-first, not brief-first.** The Instagram content is the source of truth for colors, mood, tone, imagery style, and voice — not generic "best practices."
3. **Deliberate variation.** Before building, the AI should silently pick (or be told to pick) a combination of: one Layout Archetype, one Visual Style Movement, one Typography Pairing, one Color Strategy, one Motion Personality, and one Content Choreography pattern. Documenting this combination internally prevents repetition across generations.
4. **Real content, not lorem ipsum.** Logo, post images, bios, and captions pulled from the Instagram page must be used as actual site content — cropped, arranged, and treated as real assets, not placeholders.
5. **Stylish over safe.** When in doubt, pick the braver design choice, as long as it stays legible, accessible, and true to the brand's tone (a children's bakery should not get a brutalist cyberpunk theme; a streetwear brand should not get a soft pastel wedding-invite theme).
6. **Every generation is documented.** At the top of the generated site's code or in a companion notes file, briefly state which archetype/style/pairing/color-strategy/motion combination was used, so future generations can deliberately avoid repeating it.

---

## 2. STEP 1 — EXTRACTING BRAND IDENTITY FROM INSTAGRAM

Before any design decision, the AI must analyze the provided assets and build a **Brand Identity Snapshot**:

### 2.1 From the Logo
- Identify logo type: wordmark, lettermark, pictorial mark, abstract mark, combination mark, emblem.
- Extract dominant and secondary colors (exact hex where possible).
- Note logo mood: geometric/technical, handwritten/organic, luxury/minimal, playful/rounded, vintage/retro, aggressive/sharp.
- Determine if the logo needs a light background, dark background, or works on both.

### 2.2 From the Posts (Images)
- Extract a color palette from the **actual photos**, not assumptions — sample dominant tones across multiple posts to find the real recurring palette (e.g., warm terracottas, cool studio-grey, neon night tones, pastel matte).
- Identify photography style: studio/clean, lifestyle/candid, flat-lay product, moody/cinematic, bright/airy, UGC/raw, illustrated/graphic.
- Identify subject focus: product-only, people-in-use, behind-the-scenes, food close-ups, fashion editorial, before/after, etc.
- Note image treatment patterns: consistent filter/grade, heavy contrast, film grain, oversaturated, desaturated/matte, high-key bright, low-key moody.
- Identify grid rhythm: does the brand alternate close-up/wide shots, text-post/photo-post, etc. This rhythm can inspire the site's own visual rhythm.

### 2.3 From Captions & Bio (if available)
- Extract tone of voice: witty, formal, poetic, blunt/direct, warm/personal, technical/expert, hype/energetic.
- Extract recurring keywords, taglines, or phrases that could become headline copy or section titles.
- Note emoji usage and punctuation style (all-lowercase casual vs. polished formal) — this affects UI copy tone.
- Identify the audience being spoken to (peers, customers, collectors, general public).

### 2.4 Output of Step 1
A short **Brand Identity Snapshot** should be produced (mentally or in a comment block) covering: Brand Personality (3 adjectives), Color Palette (primary/secondary/accent + neutrals), Photography Mood, Voice/Tone, and Category (fashion, food, wellness, tech, art, services, etc.). All downstream decisions must trace back to this snapshot.

---

## 3. STEP 2 — CHOOSING NOT TO REPEAT: THE VARIATION ENGINE

To guarantee 300+ distinct outputs for the same brand, the AI should treat the following six dimensions as **independent choices**, mixed and matched rather than bundled into fixed "themes." Below each dimension is a large menu — pick differently each time.

### 3.1 Dimension A — Layout Archetype (see full list in Section 5)
### 3.2 Dimension B — Visual Style Movement (see full list in Section 6)
### 3.3 Dimension C — Typography Pairing Strategy (see Section 7)
### 3.4 Dimension D — Color Strategy (see Section 8)
### 3.5 Dimension E — Motion & Interaction Personality (see Section 9)
### 3.6 Dimension F — Content Choreography Pattern (see Section 10)

**Rule of thumb:** With 6 dimensions and even just 8–12 options each, the combinatorial space is in the tens of thousands. The AI should genuinely vary its picks, not gravitate to "safe" combos every time. If a random-feeling but brand-appropriate combination emerges, use it — that is the point of this system.

---

## 4. STEP 3 — MAPPING INSTAGRAM CONTENT INTO WEBSITE SECTIONS

Regardless of the chosen archetype, Instagram content should be repurposed intelligently:

- **Logo** → Navigation bar, favicon concept, footer mark, possibly an animated loader/intro if the Motion Personality calls for it.
- **Best/most striking post images** → Hero background, section dividers, full-bleed breaks between content blocks.
- **Product/portfolio-style posts** → Gallery, shop grid, or portfolio archetype sections.
- **Lifestyle/UGC posts** → Testimonial backdrops, "in the wild" sections, social proof strips.
- **Behind-the-scenes posts** → About/story section imagery.
- **Text-heavy or quote posts** → Pull-quotes, manifesto sections, big-type statement blocks.
- **Reels/video thumbnails (if provided)** → Can inspire a video-style hero or autoplaying muted background loop section.
- **Highlights/categories on the profile** → Can directly inspire navigation structure or footer sitemap categories (e.g., if highlights are "Menu / Reviews / Location / Catering," these become nav items).

Never just dump all images into a generic grid without intent — every image placement should serve a section's purpose.

---

## 5. LAYOUT ARCHETYPES (Pick ONE per generation — do not reuse consecutively)

A large, deliberately varied list. Each includes a short description of when it fits.

1. **Classic Hero-Led Scroll** — big hero, then stacked sections. (Safe, but only "safe" if truly fitting — e.g., professional services.)
2. **Split-Screen Duality** — left/right split persists across sections (image one side, content other), alternating sides per section.
3. **Full-Bleed Cinematic Scroll** — near-full-viewport imagery per section, minimal chrome, text overlays.
4. **Editorial Magazine Grid** — asymmetric multi-column grid like a print magazine spread, pull quotes, drop caps.
5. **Single-Page Product Obsession** — everything on one long page focused on one hero product/offer, sticky buy/CTA bar.
6. **Sidebar-Persistent Layout** — fixed sidebar nav/logo, content scrolls independently on the right (portfolio/creator feel).
7. **Horizontal Scroll Story** — sections scroll horizontally instead of vertically (great for visual/fashion/art brands).
8. **Bento Grid Dashboard Style** — modular bento-box grid of varying card sizes summarizing offerings, like a modern SaaS/portfolio hybrid.
9. **Card-Stack Reveal** — sections are large cards that stack and peel away as you scroll (parallax card deck).
10. **Minimal Zine/Brutalist Single Column** — raw, single centered column, big type, little imagery ornamentation.
11. **Grid-Breaking Overlap Layout** — images and text intentionally overlap grid boundaries for an "art directed" feel.
12. **Marquee-Driven Layout** — scrolling marquees of text/logos/images as structural dividers between sections.
13. **Tabbed/Segmented Single View** — content organized into tabs (Menu/Story/Location) rather than long scroll, app-like.
14. **Storytelling Timeline Layout** — vertical or horizontal timeline structure (great for heritage brands, founders' stories).
15. **Gallery-First Landing** — homepage IS the gallery/grid of posts, minimal text, click-through to detail.
16. **Split Duality with Sticky Panel** — one panel stays pinned (e.g., product image) while the other scrolls through details.
17. **Chat/Conversational Layout** — content presented as a scrolling "conversation" or Q&A feed (playful, modern, Gen-Z brands).
18. **Poster Landing + Micro-site Depth** — homepage is a single striking poster/splash, secondary pages carry deeper content.

---

## 6. VISUAL STYLE MOVEMENTS (Pick ONE, informed by Brand Identity Snapshot)

1. **Swiss/International Typographic Style** — grid precision, sans-serif, red/black/white accents, huge whitespace.
2. **Brutalist Web** — raw HTML feel, visible borders, monospace accents, anti-polish, bold contrast.
3. **Soft Neumorphism** — soft shadows, monochrome pastel surfaces, tactile UI (good for wellness/beauty).
4. **Glassmorphism** — frosted glass panels, blur, subtle borders, layered depth (good for tech/modern lifestyle).
5. **Maximalist Collage** — layered textures, stickers, clashing type sizes, scrapbook energy (good for streetwear/youth brands).
6. **Luxury Minimalism** — generous whitespace, thin serif type, muted palette, slow elegant motion (good for jewelry/fashion/hospitality).
7. **Y2K Revival** — chrome gradients, glossy buttons, cyber fonts, early-internet nostalgia (good for fashion/music/nightlife).
8. **Organic/Earthy Natural** — hand-drawn accents, textured paper backgrounds, muted greens/browns (good for food/wellness/craft).
9. **Retro-Futurism** — bold gradients, geometric shapes, 80s/90s poster energy (good for music/events/entertainment).
10. **Art Deco Elegance** — symmetrical ornament, gold accents, geometric borders (good for restaurants, bars, boutique hotels).
11. **Playful Blob/Rounded UI** — organic blob shapes, bouncy rounded corners, bright candy palette (good for kids, apps, casual food).
12. **Cinematic Noir** — near-black backgrounds, dramatic single-light-source imagery, serif or condensed type (good for film, high fashion, spirits brands).
13. **Hand-Crafted/Zine Aesthetic** — imperfect scans, tape textures, doodles, DIY energy (good for indie artists/small creators).
14. **Corporate Modern/SaaS Clean** — soft gradients, rounded cards, ample icons (good for services/consulting even if sourced from Instagram).

---

## 7. TYPOGRAPHY PAIRING STRATEGIES (Pick ONE)

1. Bold Display Serif (headlines) + Clean Grotesk Sans (body)
2. Oversized Condensed Sans (headlines) + Humanist Serif (body)
3. Monospace (headlines/labels) + Neutral Sans (body) — technical/editorial feel
4. Handwritten/Script accent (small accents only) + Grotesk Sans (everything else)
5. Single Superfamily used at wildly varying weights/sizes for all text (unified but dynamic)
6. Slab Serif (headlines) + Thin Sans (body) — strong contrast, editorial
7. Variable-weight Sans that shifts weight based on section importance
8. All-caps Tracked-out Sans for headlines + lowercase relaxed serif for body (fashion-editorial feel)

Always pull the **actual visual logic of the logo type** into this decision — e.g., a script-logo brand should not pair with a rigid mono/grotesk system without a bridging accent font.

---

## 8. COLOR STRATEGIES (Pick ONE)

1. **Direct Extraction** — use the literal palette sampled from the Instagram posts, unmodified.
2. **Extraction + Push to Extreme** — take the sampled palette and push contrast/saturation further for a bolder digital version.
3. **Monochrome + One Accent** — reduce the whole site to near-grayscale plus a single accent pulled from the logo.
4. **Duotone Treatment** — apply a two-color duotone filter across all photography for cohesion, drawn from brand colors.
5. **Dark Mode Native** — build the entire site dark-first, using brand accent colors as highlights against near-black.
6. **Light, Airy, Desaturated** — very pale neutral backgrounds, letting real photography supply the only strong color.
7. **High-Contrast Pop** — pure white/black base with one extremely saturated accent color from the brand for CTAs and highlights only.

---

## 9. MOTION & INTERACTION PERSONALITY (Pick ONE)

1. **Still & Confident** — little to no animation; power comes from static composition (luxury/editorial).
2. **Slow Cinematic Fades** — long, slow opacity/parallax transitions between sections.
3. **Snappy & Energetic** — quick spring-based transitions, hover bounces, fast micro-interactions (youth/streetwear/fitness).
4. **Scroll-Triggered Storytelling** — elements animate in sequence tied precisely to scroll position (great for storytelling timeline archetype).
5. **Cursor-Reactive** — custom cursor, magnetic buttons, elements that subtly follow pointer movement (portfolio/creative brands).
6. **Marquee & Loop Driven** — constant slow-moving marquees/loops for ambient movement without demanding attention.
7. **Minimal Utility Motion** — motion used only for functional feedback (button states, loading), nothing decorative (SaaS/service brands).

---

## 10. CONTENT CHOREOGRAPHY PATTERNS (Pick ONE)

How sections are ordered and paced:

1. **Hook → Proof → Offer → Story → CTA**
2. **Story → Product → Social Proof → CTA** (founder-led brands)
3. **Visual Overload First, Explanation Second** (let imagery hook before any text)
4. **Manifesto First** (a bold statement/philosophy section before anything else — good for values-driven brands)
5. **Product Deep-Dive Immediately** (no fluff, straight to offering — good for single-product brands)
6. **Alternating Rhythm** — strictly alternate large-image sections with small-text sections throughout, like a heartbeat.

---

## 11. TECHNICAL & UX REQUIREMENTS (Apply to Every Generation, No Exceptions)

- Fully responsive across mobile, tablet, and desktop — mobile treated as a first-class layout, not a squeezed-down desktop.
- Real accessibility basics: sufficient color contrast, alt text for all images (generated from post captions/context where possible), keyboard-navigable menus, semantic HTML structure.
- Fast-loading: images optimized/compressed, lazy-loaded below the fold.
- Clear, working navigation regardless of how experimental the layout is — a user should never feel lost.
- A working contact path (form, email, or link) and links back to the actual Instagram profile and any other socials mentioned in the bio.
- Consistent footer with logo, socials, and basic legal/contact info even in more experimental archetypes.
- SEO basics: page title, meta description, and semantic heading hierarchy reflecting the brand name and category.

---

## 12. QUALITY CHECKLIST BEFORE FINALIZING ANY GENERATION

- [ ] Does the color palette actually trace back to the logo/posts, or is it generic?
- [ ] Is the chosen Layout Archetype different from the last few generations for this brand?
- [ ] Is the chosen Visual Style Movement appropriate to the brand's category and tone (not just "cool for its own sake")?
- [ ] Are real Instagram images used purposefully, not dumped into a generic grid?
- [ ] Does the copy tone match the extracted voice from captions/bio?
- [ ] Is the site still legible, navigable, and accessible despite stylistic boldness?
- [ ] Would this website be mistaken for a generic template if shown next to the last 10 generations? (It should not be.)

---

## 13. FINAL NOTE FOR THE AI SYSTEM EXECUTING THIS BRIEF

Every time this brief is used, silently choose a fresh combination across Sections 5–10, ground every decision in the real Instagram content per Section 2, and build with the technical rigor of Section 11. The measure of success is not "a nice website" — it is "a nice website that could only have been made for THIS brand, in a way that hasn't been repeated across the other 299 versions."

Variety is a feature. Brand-truth is the constraint that keeps variety from becoming randomness.
