# Pixa-style image editor — comprehensive feature inventory

This inventory deduplicates user-facing features harvested from every source listed in the brief. It is structured for direct PRD use: each feature has a short user-oriented description, a `Variants` list for technical/UX deltas worth tracking at feature level, and `Sources` citing every project that documents it. Names are canonicalized (e.g., "Background removal" subsumes "BG remover," "Cutout," "Remove BG"). Single-source marginal features are dropped or pushed to the "Gaps" section.

---

## Sources surveyed

| Source | Type | llms.txt found? | Fallback used |
|---|---|---|---|
| Pixa / Pixelcut | SaaS | ✅ `https://www.pixa.com/llms.txt` (canonical tool catalog) | pixelcut.ai feature pages, App Store changelog |
| fal.ai | SaaS / inference platform | ✅ `https://fal.ai/llms.txt` (+ `docs.fal.ai/llms.txt`) | homepage, models gallery |
| Replicate | SaaS / inference platform | ✅ `https://replicate.com/docs/llms.txt` (marketing alias redirects to docs) | docs reference, homepage |
| Runway ML | SaaS | ❌ none at `runwayml.com/llms.txt` | runwayml.com/product, workflows, research pages; Replicate's `runwayml/gen4-image/llms.txt` |
| xAI Aurora / Grok Imagine | SaaS | ❌ none at `x.ai/llms.txt` | docs.x.ai (quickstart, imagine, image gen, video, image understanding), x.ai/news, Wikipedia |
| SnapOtter | OSS editor (AGPLv3) | Runtime-only (`/api/v1/llms.txt`), no public docs llms.txt | snapotter.com, docs.snapotter.com, GitHub README, release notes |
| IOPaint | OSS inpaint (Apache-2.0, archived) | ❌ | GitHub README, iopaint.com/models, PyPI |
| infinite-kanvas (fal community) | OSS demo (MIT) | ❌ | GitHub README |
| InvokeAI | OSS generation suite (Apache-2.0) | ❌ at `invoke-ai.github.io/InvokeAI/llms.txt` | docs site, support KB articles, deepwiki, releases |
| @anu3ev/fabric-image-editor | OSS lib (MIT) | ❌ | npm page, GitHub README, live demo |
| Davronov-Alimardon/canva-clone | OSS app (Apache-2.0) | n/a | GitHub README, live demo |
| Amanuel-1/kanvas | OSS app (unspecified) | n/a | GitHub README |
| Fabric.js v6/v7 | OSS canvas lib (MIT) | ❌ at `fabricjs.com/llms.txt` | fabricjs.com docs (intro parts 1–4, getting started), GitHub releases |
| Konva.js | OSS canvas lib (MIT) | ✅ `konvajs.org/llms.txt` + `llms-full.txt` | docs overview, about, FAQ |
| @imgly/background-removal | OSS lib (AGPLv3) | ❌ at `img.ly/llms.txt` | GitHub README, npm pages, img.ly blog |
| ComfyUI | OSS workflow engine (GPL-3.0) | ❌ retrievable at `docs.comfy.org/llms.txt` | GitHub README (comfy-org + comfyanonymous), ComfyUI_frontend README |
| LaMa | Model (Apache-2.0) | n/a | advimman/lama GitHub, WACV 2022 paper, iopaint model page |
| PowerPaint | Model (open) | n/a | open-mmlab/PowerPaint, project page, paper |
| BrushNet | Model (open) | n/a | TencentARC/BrushNet, project page, paper |
| SAM 2 | Model (Apache-2.0) | n/a | facebookresearch/sam2, paper, sam2.metademolab.com |
| Flux Fill | Model (NC `[dev]` / API `[pro]`) | n/a | bfl.ai, HF model card, ComfyUI tutorial, Replicate model card |
| Real-ESRGAN | Model (BSD-3) | n/a | xinntao/Real-ESRGAN GitHub |
| GFPGAN | Model (Apache-2.0) | n/a | TencentARC/GFPGAN GitHub |
| CodeFormer | Model (S-Lab) | n/a | HF Space, Segmind blog |
| rembg / U²-Net / Anime-Segmentation | Models (MIT/Apache) | n/a | danielgatis/rembg, U²-Net paper, SkyTNT/anime-segmentation |

---

## 1. Canvas & editor core

### 1.1 Infinite / bounded canvas workspace
Free-form workspace where the user pans and zooms across a large drawing surface. Some implementations bound the work area to a defined "design" rectangle (Pixa, Canva-clone); others expose a truly infinite plane (InvokeAI canvas, infinite-kanvas, ComfyUI graph).
- **Variants:**
  - Bounded "montage area" with clipping region (@anu3ev/fabric-image-editor).
  - Infinite spatial canvas with viewport culling (infinite-kanvas, InvokeAI Unified Canvas).
  - Multi-layer scene graph: Stage → Layer → Group → Shape (Konva).
- **Sources:** Pixa pixelcut.ai/ai-image-editor; InvokeAI canvas KB (support.invoke.ai/.../151000096682-control-canvas); infinite-kanvas README; @anu3ev README; Konva overview (konvajs.org/docs/overview.html); Fabric.js docs (fabricjs.com/docs).

### 1.2 Zoom and pan with viewport transforms
Mouse-wheel / pinch zoom, drag-to-pan, fit-to-screen, and zoom-to-pointer with persistent viewport matrix. Konva/Fabric expose this primitively; the OSS editors wrap it with constrained pan ranges and keyboard hotkeys.
- **Variants:**
  - Constrained pan within montage bounds (@anu3ev PanConstraintManager).
  - Zoom-to-pointer with limits (@anu3ev ZoomManager, Konva).
  - Spacebar-to-pan during bbox-edit (InvokeAI canvas).
- **Sources:** Konva docs; Fabric.js getting-started; @anu3ev README; InvokeAI canvas KB.

### 1.3 Layers, z-order, lock, hide, group/ungroup
Multi-layer stack with bring-to-front/back, per-layer lock, visibility toggle, and arbitrary grouping/ungrouping. Required for any real editor.
- **Variants:**
  - n-level nested groups (Fabric v6 Group rewrite, Konva groups).
  - Layer typing (raster / mask / control / reference / regional guidance) — InvokeAI.
  - Locking per object (@anu3ev ObjectLockManager).
- **Sources:** Fabric.js docs; Konva overview; @anu3ev README (LayerManager, GroupingManager, ObjectLockManager); InvokeAI Layers KB (151000178148); SnapOtter README.

### 1.4 Transform: move, scale, rotate, skew, flip
Object-level translation, uniform/non-uniform scale, rotation with snap, skew (Fabric only), horizontal/vertical flip. On-canvas control handles render around the selection.
- **Variants:**
  - Live rotation-angle badge (@anu3ev AngleIndicatorManager).
  - Konva `Transformer` with multi-node anchors and snap-to-angle.
  - Custom per-corner controls (Fabric `createPolyControls`).
- **Sources:** Fabric.js intro parts 1–3; Konva docs; @anu3ev README; SnapOtter (Rotate & Flip tool).

### 1.5 Selection (single, multi, marquee, lasso)
Click to select, shift-click to multi-select, drag marquee to enclose multiple objects, lasso freehand/polygon for irregular regions. Pixel-accurate hit-testing where available.
- **Variants:**
  - Marquee multi-select (Fabric ActiveSelection, Konva Transformer multi-node).
  - Lasso freehand + polygon mode for raster masks (InvokeAI v6.12 Lasso tool).
  - `perPixelTargetFind` for non-rect hit detection (Fabric).
- **Sources:** Fabric.js docs; Konva overview; InvokeAI release notes (v6.12).

### 1.6 Crop, resize, fit
Rectangular crop, aspect-ratio presets, shape-crop, fit-to-canvas (contain/cover), free resize by pixels / percentage / social-media presets.
- **Variants:**
  - Pixel / % / social-preset resize (SnapOtter Resize).
  - Aspect-ratio presets + shape crop (SnapOtter Crop).
  - Smart Crop (subject/face/trim-aware) — SnapOtter AI; Pixa Showcase implies similar.
  - Content-aware seam-carving resize (SnapOtter).
  - `image-contain` / `image-cover` / `scale-montage` import modes (@anu3ev).
- **Sources:** SnapOtter snapotter.com tool list; Pixa llms.txt; @anu3ev README.

### 1.7 Rich text
On-canvas text with font family/size/weight/italic/alignment/line-height/char-spacing, fill, gradient, stroke, underline/overline/linethrough, per-character styling, IME composition, optional text-on-path/curve, padding, per-corner radius for text-shape combos.
- **Variants:**
  - Per-character styling via Fabric IText/Textbox.
  - Text-on-path / TextPath (Konva).
  - Composite shape + text groups with rounded corners and alignment (@anu3ev).
  - "Text tool" in raster canvas with font picker, then commit-to-raster (InvokeAI v6.12).
- **Sources:** Fabric.js docs; Konva overview; @anu3ev README; InvokeAI release notes.

### 1.8 Shapes and drawing primitives
Rect, circle, ellipse, triangle, polygon/polyline, line, star, arrow, ring, wedge, arc, sprite, path (incl. SVG paths), and decorative preset families (heart, badge, gear, sparkle, bookmark, tag, moon).
- **Variants:**
  - Custom shape via `sceneFunc(context)` draw callback (Konva).
  - Custom subclass via `fabric.Object` (Fabric).
  - Preset decorative shape library with inner-text + per-corner radius (@anu3ev).
- **Sources:** Konva overview; Fabric.js intro part 2; @anu3ev README; Canva-clone README.

### 1.9 Free-drawing and brushes
Pencil, spray, pattern, and custom brushes for freehand annotation, mask painting, and signature-style strokes.
- **Variants:**
  - `freeDrawingBrush` (Fabric: Pencil/Circle/Spray/Pattern brushes).
  - Brush mask painting with mouse-wheel size adjust (IOPaint, InvokeAI).
  - Eraser as separate package `erase2d` in Fabric v6.
- **Sources:** Fabric.js docs; IOPaint README; InvokeAI canvas KB; Canva-clone README.

### 1.10 Masks and clip paths
Use any object as a clipping region for another object, group, or whole stage. Includes alpha-style masking via clipping function (Konva) or `clipPath` (Fabric).
- **Variants:**
  - Arbitrary-shape `clipFunc` (Konva); rectangular `clipX/Y/Width/Height` shortcut.
  - Fabric `clipPath` accepts any Fabric object as the mask.
  - Inpaint Mask Layer with denoising-strength control (InvokeAI).
- **Sources:** Konva docs; Fabric.js docs; InvokeAI canvas KB (151000178148).

### 1.11 Filters and adjustments
Composable image filters: brightness, contrast, exposure, saturation, hue, temperature, sharpness, blur, noise, pixelate, posterize, emboss, threshold, kaleidoscope, invert, grayscale, sepia, vibrance, gamma, vintage, kodachrome, technicolor, polaroid, convolute, blend-color, blend-image. Plus selective replace/invert color and color-blindness simulation.
- **Variants:**
  - WebGL and Canvas2D backends with custom fragment shaders (Fabric).
  - Per-shape filter chain after `cache()` (Konva).
  - Adaptive / unsharp-mask / high-pass sharpening presets (SnapOtter Sharpening).
  - Replace-color and invert (SnapOtter Replace & Invert Color).
  - Protanopia/deuteranopia/tritanopia preview (SnapOtter).
- **Sources:** Fabric.js docs (filters list); Konva docs (filters list); SnapOtter Adjustments tools.

### 1.12 Snapping, alignment guides, measurement overlays
Snap to montage edges, object centers, equal-spacing detection between siblings, plus on-hold measurement labels showing pixel distance to neighbors and to the canvas frame.
- **Variants:**
  - Visual smart guides + equal-spacing detection (@anu3ev SnappingManager).
  - Ctrl temporarily disables snapping (@anu3ev).
  - Alt-hover measurement labels (@anu3ev MeasurementManager).
- **Sources:** @anu3ev README.

### 1.13 History (undo/redo)
Full undo/redo stack with state snapshots, capable of restoring full canvas JSON. Some implementations debounce writes; others snapshot per discrete operation.
- **Variants:**
  - State-snapshot stack (@anu3ev HistoryManager).
  - In-memory history per canvas action (infinite-kanvas, kanvas).
  - Workflow-level redo (InvokeAI session queue).
- **Sources:** @anu3ev README; infinite-kanvas README; kanvas README; Fabric.js intro.

### 1.14 Clipboard, duplicate, delete
System-clipboard copy/paste, duplicate selection (incl. nested groups), and group-aware deletion.
- **Variants:**
  - Native OS clipboard via ClipboardManager (@anu3ev).
  - Group/nested deletion (@anu3ev DeletionManager).
- **Sources:** @anu3ev README; Fabric.js docs.

### 1.15 Background management
Solid color, gradient (linear/radial multi-stop with angle/center/radius control), pattern, and image backgrounds with import/remove.
- **Variants:**
  - Multi-stop gradient backgrounds (@anu3ev).
  - `backgroundImage` / `overlayImage` / `backgroundColor` / `overlayColor` (Fabric).
- **Sources:** @anu3ev README; Fabric.js docs.

### 1.16 Templates and presets
JSON-serializable templates that capture canvas state (incl. background) and reapply on demand; pre-built gallery with category browsing.
- **Variants:**
  - Serialize selection or whole canvas to JSON template (@anu3ev TemplateManager).
  - Pre-built Canva-style template gallery with pro-gated premium tier (Canva-clone, Pixa).
  - Monthly-refreshed template feed (Pixa).
- **Sources:** Pixa llms.txt; Canva-clone README; @anu3ev README.

### 1.17 Export
PNG, JPEG (with quality), SVG, PDF, and JSON state. Server-side PNG/JPEG streaming via node-canvas; client-side `toDataURL`, `toBlob`, `toImage`, `toCanvas`. Image-to-PDF combine and Image-to-Base64 inline encoding.
- **Variants:**
  - JSON round-trip (`toJSON` / `loadFromJSON`, Konva `toJSON` / `Node.create`).
  - Multi-format (PNG/JPG/SVG/PDF) via dynamic jsPDF load (@anu3ev).
  - Pixel-ratio multiplier export for high-DPI (Konva, Fabric).
  - PDF export only via third-party libs in Fabric/Konva.
  - High-resolution export gated to paid tier (Canva-clone).
- **Sources:** Fabric.js docs; Konva overview; @anu3ev README; SnapOtter (Image to PDF, Image to Base64); Canva-clone README.

### 1.18 Format conversion and extended I/O
Convert between common raster formats plus read exotic inputs (JXL, RAW, ICO, TGA, PSD, EXR, HDR), write AVIF, and convert SVG↔raster.
- **Variants:**
  - Extended read formats incl. PSD/EXR/HDR (SnapOtter).
  - AVIF output across all tools (SnapOtter).
  - SVG → PNG/JPEG/WebP/AVIF/TIFF/GIF/HEIF with custom scale/DPI (SnapOtter SVG to Raster).
  - Raster → SVG via tracing/vectorization (SnapOtter Image to SVG).
  - PDF → image extraction (SnapOtter).
- **Sources:** SnapOtter tool catalog.

### 1.19 GIF and animation tooling
Resize, optimize, change speed, reverse, extract frames, rotate animated GIFs.
- **Sources:** SnapOtter GIF Tools.

### 1.20 Compression and web optimization
Quality-target or target-file-size compression with live preview, plus an "optimize for web" combined format+quality workflow.
- **Sources:** SnapOtter Compress, Optimize for Web.

### 1.21 Watermarking and overlay
Add text watermark, image (logo) watermark, free text overlay with styling, layered image composition with position and opacity, and meme-style template overlays.
- **Variants:**
  - Invisible watermark encode/decode (fal.ai model category).
  - "GROK" output watermark (xAI grok-2-image; model-dependent).
- **Sources:** SnapOtter Watermark & Overlay tools; fal.ai llms.txt; xAI image-gen docs.

### 1.22 Metadata edit and strip
View, edit, or remove EXIF / GPS / camera fields. Important for privacy and ICC-profile preservation across the pipeline.
- **Variants:**
  - Strip vs. selective edit (SnapOtter Remove Metadata, Edit Metadata).
  - ICC color profile preservation (IOPaint post-fix release).
- **Sources:** SnapOtter; IOPaint release notes.

### 1.23 Composition utilities (collage, stitch, split, frame, screenshot beautify)
Pre-built collage/grid templates, side-by-side/stacked/grid stitching, splitting an image into tiles, adding borders/rounded corners/drop shadows, and "beautify screenshot" (gradient bg + device frame + shadow + social sizing).
- **Sources:** SnapOtter Layout & Composition tools.

---

## 2. AI image generation

### 2.1 Text-to-image
Generate images from a natural-language prompt. Every SaaS surface and self-hosted suite ships this; the differentiator is model selection and rendering style.
- **Variants:**
  - Multi-model selector exposing user-pickable engines (Pixa: Flux, GPT image, Imagen, Luma, Ideogram; Runway: Gen-4.5, Seedream 5.0, Veo, Nano Banana Pro, etc.; xAI: Aurora / grok-imagine-image-quality up to 2K).
  - Batch `n` per call (xAI 10/req; Pixa 2–4 variations; Grok Imagine 4 variations/gen).
  - Aspect-ratio presets (xAI: 2:1, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16, 1:2, auto).
  - LLM-powered prompt expansion / rewrite (InvokeAI Qwen2.5; Runway LLM nodes for prompt enhancement).
  - Prompt wildcards, weighting `(token:1.2)`, and `{a|b|c}` choice (ComfyUI, InvokeAI attention syntax).
  - Local Stable Diffusion / FLUX / Qwen Image / Z-Image generation (InvokeAI, ComfyUI).
- **Sources:** Pixa llms.txt; fal.ai llms.txt; Replicate docs llms.txt; Runway product page; xAI imagine docs (docs.x.ai/.../images/generation); InvokeAI release notes; ComfyUI README.

### 2.2 Image-to-image and reference-guided generation
Use one or more source images as references; preserve subject, location, or style while applying a prompt-driven transformation.
- **Variants:**
  - Up to 10 reference images (Replicate FLUX-2-Flex).
  - 1–3 references with `@character`/`@location` tagging (Runway Gen-4 Image).
  - Up to 3 references combining subject + outfit + scene (xAI Aurora / Grok Imagine; Pixa AI Edit up to 4).
  - Streaming image-to-image with partial result rendering on canvas (infinite-kanvas + fal Flux Kontext).
  - IP-Adapter / FLUX Redux reference image as a global or regional layer (InvokeAI).
- **Sources:** Replicate llms.txt; Runway gen4-image card; xAI imagine docs; Pixa llms.txt; infinite-kanvas README; InvokeAI canvas KB (151000178246).

### 2.3 Style transfer / restyle
Apply an artistic style preset or custom LoRA to an existing image; the user picks a preset chip or pastes a LoRA URL.
- **Variants:**
  - Preset style chip + custom LoRA URL (infinite-kanvas via Flux Kontext LoRA).
  - "Change art direction / style" Aleph transform on video (Runway).
  - Restyle (real footage → anime/watercolor/etc.) — Runway Aleph.
- **Sources:** infinite-kanvas README; Runway product page; Replicate runwayml/gen4-image.

### 2.4 Character and location consistency
Maintain the same person, character, or environment across multiple generated images while changing pose, lighting, or scene.
- **Variants:**
  - `@character`/`@location` tags across iterations (Runway Gen-4 Image).
  - Iterative refinement using prior outputs as new references (Runway).
  - "Showcase" — swap products while keeping the AI-generated scene fixed (Pixa).
- **Sources:** Runway product page; Replicate runwayml/gen4-image llms.txt; Pixa llms.txt.

### 2.5 LoRA, embeddings, hypernetworks, textual inversion
Load and stack low-rank adapters and textual-inversion embeddings to personalize a base model with a brand identity, character, or style.
- **Variants:**
  - Stackable LoRA/LoCon/LoHa, hypernetworks, and `embedding:filename` prompts (ComfyUI).
  - LoRA management with enable/disable toggle; FLUX.2 Klein LoRA; Qwen Image Lightning turbo LoRAs (InvokeAI).
  - FLUX LoRA Fast Training for brand/persona personalization (fal.ai, Replicate).
- **Sources:** ComfyUI README; InvokeAI release notes; fal.ai llms.txt; Replicate docs.

### 2.6 Model manager (install, version, fine-tune destinations)
Browse, download, install, and switch between foundation models, ControlNets, T2I-Adapters, and LoRAs from local files or Hugging Face repo IDs.
- **Variants:**
  - HuggingFace repo install + ckpt/diffusers formats (InvokeAI, IOPaint).
  - Orphan-model cleanup and bulk reidentify (InvokeAI).
  - One-click private/fine-tuned endpoints with bring-your-own-weights (fal.ai).
  - Custom Cog packaging + GitHub Actions CI/CD push (Replicate).
  - Immutable model-version hashes for reproducibility (Replicate).
- **Sources:** InvokeAI release notes; fal.ai llms.txt; Replicate docs.

### 2.7 Generation parameter control
Seed, steps, guidance/CFG, sampler, denoising strength, resolution, aspect ratio, negative prompt, safety-checker toggle.
- **Variants:**
  - REST endpoint exposing all params programmatically (InvokeAI).
  - Toggleable safety checker on SDXL family (Replicate; can be disabled with caveats).
  - LCM-LoRA fast 2–8 step sampling (IOPaint, ComfyUI).
  - Faster vs. highest-quality persisted toggle (Pixa).
- **Sources:** InvokeAI release notes; Replicate docs; IOPaint README; Pixa llms.txt.

### 2.8 Auto-multi-variation
Return N variants per prompt by default for user picking.
- **Variants:**
  - 2–4 variations per prompt (Pixa).
  - 4 variations per gen (Grok Imagine).
  - Up to 10 (xAI grok-2-image).
- **Sources:** Pixa llms.txt; xAI imagine docs.

### 2.9 Structural/control conditioning (ControlNet / T2I-Adapter / Control LoRA)
Constrain generation to follow an input pose, depth map, canny edges, normal map, or scribble — drawn or auto-extracted from a reference.
- **Variants:**
  - Weight, begin/end-step %, and control-mode per adapter (InvokeAI Control Layer).
  - Auto-process control adapter (run Canny/depth/normal extractor inside the graph) (InvokeAI).
  - FLUX Canny / FLUX Depth (InvokeAI).
  - GLIGEN grounded text-to-image with bounding boxes (ComfyUI).
- **Sources:** InvokeAI Control Layers KB (151000105880); ComfyUI README.

### 2.10 Regional prompting
Paint a region on the canvas, give it its own positive/negative prompt or its own reference image, and let the global prompt cover everything else.
- **Variants:**
  - Regional Guidance Layer with auto-negative inverse-masking (InvokeAI).
  - Regional Reference Image Layer via IP-Adapter/FLUX Redux (InvokeAI).
- **Sources:** InvokeAI Regional Guidance Layers KB (151000165024).

---

## 3. AI image editing (inpaint / outpaint / generative fill)

### 3.1 Object removal ("Magic eraser" / "Cleanup")
Brush over an unwanted object, person, watermark, or defect; the model fills the masked area with context-aware photo-real content. Every SaaS in the survey ships this; LaMa is the canonical fast model, Flux Fill the SOTA quality option.
- **Variants:**
  - Fast context-only fill (LaMa, LDM, ZITS, MAT, FcF, Manga, OpenCV baseline) — IOPaint.
  - SOTA inpaint with text guidance (Flux Fill `[pro]` / `[dev]`, PowerPaint, BrushNet, SD/SDXL inpaint).
  - Auto-mask via SAM2 click/box or text-described object ("the red car") — infinite-kanvas EVF-SAM, IOPaint SAM2.
  - Specialized variants: Remove Text from Image, Remove People (Pixa); Object Eraser tool (SnapOtter); video object remove (Runway Aleph).
  - Mask-blur and histogram-match for natural boundary blending (IOPaint).
- **Sources:** Pixa llms.txt; SnapOtter Object Eraser; IOPaint README + model list; Runway Aleph "Remove from Video"; LaMa GitHub; PowerPaint GitHub; BrushNet GitHub; Flux Fill HF card.

### 3.2 Prompt-driven object insertion / replacement (Generative fill)
Mask a region and type what should appear; model paints in the described content while matching surrounding lighting and perspective.
- **Variants:**
  - Text-guided inpaint on any SD1.5/SDXL base via BrushNet plug-in (IOPaint).
  - Shape-guided insertion with "fitting degree" slider — PowerPaint.
  - "Generative Fill" toolbar action (Pixa).
  - "Replace object" / "Change object" / "Change outfit" video transforms (Runway Aleph).
- **Sources:** Pixa llms.txt; Runway product page; IOPaint README (BrushNet, PowerPaint, Paint-by-Example); Flux Fill model card.

### 3.3 Reference-image inpaint (Paint-by-Example)
Replace a masked region using a reference example image rather than a text prompt — useful for inserting a specific product into a scene.
- **Sources:** IOPaint README (Fantasy-Studio/Paint-by-Example); fal.ai image-editing category.

### 3.4 Outpaint / canvas expansion ("Uncrop")
Extend the image beyond its current borders, generating photorealistic continuation of the scene. Often paired with aspect-ratio change for social formats.
- **Variants:**
  - One-step uncrop with prompt-free continuation (Pixa Uncrop).
  - PowerPaint outpainting task prompt with directional ratio (IOPaint).
  - Flux Fill outpainting (BFL).
  - Bbox-expand on raster canvas (InvokeAI).
- **Sources:** Pixa llms.txt; IOPaint README; bfl.ai/flux-1-tools; InvokeAI canvas KB.

### 3.5 Promptable / click-to-mask segmentation (smart cutout)
Tap a point, drag a box, or describe an object in text; the model auto-generates a precise pixel mask. Powers all downstream cutout/inpaint flows without manual brushing.
- **Variants:**
  - Click/box prompts with positive/negative refinement (SAM, SAM2, MobileSAM, vit_b/l/h).
  - Text-prompted segmentation (EVF-SAM — infinite-kanvas).
  - "Everything mode" auto-mask of all objects (SAM 2).
  - Video object tracking across frames with streaming memory (SAM 2).
- **Sources:** IOPaint README (SAM plugins); infinite-kanvas README; facebookresearch/sam2 GitHub; sam2.metademolab.com.

### 3.6 In-image text rendering / editing
Render or edit legible text inside an image — strong typography that respects scene perspective and material.
- **Variants:**
  - Image-aware "Draw Text" via AnyText (IOPaint).
  - Native strong text rendering on Aurora / Grok Imagine (xAI).
- **Sources:** IOPaint README (AnyText); xAI imagine docs.

### 3.7 Multi-image edit / merge
Combine up to N reference images into one composite edit (e.g., subject + garment + backdrop).
- **Variants:**
  - Up to 3 source images per edit request (xAI Aurora multi-image edit).
  - Up to 4 references in AI Edit (Pixa).
  - Up to 10 references (Replicate FLUX-2-Flex).
- **Sources:** xAI imagine docs; Pixa llms.txt; Replicate llms.txt.

---

## 4. AI enhancement & restoration

### 4.1 Super-resolution / upscale
Enlarge an image to 2×/4× (or arbitrary scale) while reconstructing realistic detail and reducing noise/compression artifacts.
- **Variants:**
  - General Real-ESRGAN + anime model (SnapOtter, ComfyUI, IOPaint).
  - Cloud upscale APIs (Pixa Image Upscaler API, Clarity Upscaler on fal.ai).
  - SwinIR / Swin2SR / ESRGAN node variants (ComfyUI).
  - Tile mode for large images on limited VRAM (Real-ESRGAN).
  - Alpha-channel and 16-bit input support (Real-ESRGAN).
  - Video upscale (Runway Apps).
- **Sources:** Pixa llms.txt; SnapOtter Image Upscaling; IOPaint RealESRGAN plugin; ComfyUI README; fal.ai llms.txt; Runway product page; xinntao/Real-ESRGAN.

### 4.2 Face restoration / enhancement
Restore blurred, low-res, or old portrait faces; common in vintage-photo and AI-portrait cleanup flows.
- **Variants:**
  - GFPGAN v1.3 (default), with CPU-friendly variant and adjustable upscale factor.
  - CodeFormer with user-facing fidelity slider (identity vs. polish).
  - RestoreFormer (IOPaint).
  - CodeFormer ↔ GFPGAN auto-fallback (SnapOtter Face Enhancement).
- **Sources:** SnapOtter; IOPaint README; GFPGAN GitHub; CodeFormer (Segmind blog).

### 4.3 Denoise / sharpen / unblur
Reduce grain/noise, sharpen edges, and recover detail from defocused or motion-blurred photos.
- **Variants:**
  - AI denoise (SnapOtter Noise Removal).
  - Adaptive / unsharp mask / high-pass sharpening presets (SnapOtter).
  - AI unblur as standalone tool (Pixa).
- **Sources:** Pixa llms.txt; SnapOtter tool list.

### 4.4 Photo restoration (scratch, tear, damage)
Fix physical damage on scanned old photos — scratches, tears, dust — in one click.
- **Sources:** SnapOtter Photo Restoration.

### 4.5 Colorization
Convert black-and-white photos to full color via a learned color prior.
- **Sources:** SnapOtter AI Colorization.

### 4.6 Red-eye correction
Auto-detect and correct red-eye in flash photos.
- **Sources:** SnapOtter Red Eye Removal.

### 4.7 One-click auto-enhance
Smart analysis + composite adjust (white balance, exposure, contrast, saturation) in a single action.
- **Sources:** SnapOtter Image Enhancement.

### 4.8 Auto face / PII blur
Detect faces and sensitive identifiers and blur them automatically — for compliance/redaction workflows.
- **Sources:** SnapOtter Face / PII Blur.

### 4.9 Passport / ID photo generator
Generate a compliant passport/ID-format photo from a portrait input.
- **Sources:** SnapOtter Passport Photo.

### 4.10 PNG transparency fixer
AI matting to repair PNGs where transparency was baked into a flat color or otherwise corrupted.
- **Sources:** SnapOtter PNG Transparency Fixer.

---

## 5. Background & subject

### 5.1 Background removal / cutout
One-click subject isolation producing a transparent PNG. Anchor feature; every source ships it.
- **Variants:**
  - In-browser ONNX/WASM with offline cache (@imgly/background-removal, model variants 44/88/176 MB).
  - Server-side / Node variant for batch and very large images (@imgly/background-removal-node).
  - Cloud bulk API (Pixa Background Remover API).
  - Specialized models: u2net (general), u2netp (4 MB lightweight), u2net_human_seg, isnet-general-use, isnet-anime, silueta (rembg); Bria model (infinite-kanvas).
  - Anime / illustration cutout (SkyTNT anime-segmentation; rembg isnet-anime).
  - Logo-specific cutout, Signature cutout (Pixa).
  - GPU-accelerated local (SnapOtter Remove Background).
  - Alpha-matting refinement for hair/fuzzy edges (rembg `-a` flag).
  - Clothing parsing into Upper/Lower/Full body (rembg u2net_cloth_seg).
- **Sources:** Pixa llms.txt; SnapOtter; IOPaint README (RemoveBG, Anime-Segment); infinite-kanvas README; imgly/background-removal-js README; rembg README.

### 5.2 Background replacement (color, image, AI-generated scene)
Swap the background for a solid color, a user-uploaded image, or an AI-generated scene matched to the subject's lighting and perspective.
- **Variants:**
  - Solid color / white background (Pixa White Background).
  - User-supplied image (Canva-clone, Pixa Change Background).
  - AI-generated context-aware scene with matching lighting (Pixa AI Background Generator and Background Generator API).
  - Video backdrop change / time-of-day change / relight (Runway Aleph).
- **Sources:** Pixa llms.txt; Canva-clone README; Runway product page.

### 5.3 Background blur (subject-aware depth effect)
Detect subject, blur the background to a configurable depth, preserving subject edges.
- **Sources:** Pixa Blur Background.

### 5.4 Shadow / relight generation
Generate a realistic shadow under a cutout product or relight an existing scene to a different time-of-day or lighting setup.
- **Variants:**
  - Relight image (Pixa AI Photoshoot / Showcase implied; Runway Apps "Relight Scene").
  - Time-of-day change (Runway Aleph).
- **Sources:** Pixa llms.txt; Runway product page.

### 5.5 Product photography / virtual staging
Generate studio-style product photography from a flat cutout image; place product in an AI-generated scene; swap products inside a fixed scene.
- **Variants:**
  - AI Photoshoot / AI Product Photos (Pixa).
  - Showcase scene-swap (Pixa).
  - Virtual Staging / Reshoot Product workflows (Runway Apps).
- **Sources:** Pixa llms.txt; Runway product page.

### 5.6 Virtual try-on
Render clothing on a person image while preserving garment details, draping, and pose; commercial API surface.
- **Sources:** Pixa Try-On API (pixelcut.ai/api); Runway Apps "Virtual Try-On."

---

## 6. Batch & automation

### 6.1 Batch processing
Apply a tool to many images at once — typically multi-file selection or watch-folder ingest.
- **Variants:**
  - Unlimited multi-file batch across all tools (SnapOtter).
  - CLI batch `iopaint run` over an image folder with mask folder or shared mask (IOPaint).
  - Bulk Pixa background removal with preserved filenames.
  - rembg watch folder, FFmpeg pipe for video frames.
  - ComfyUI queue auto-runs N copies with seed iteration.
- **Sources:** SnapOtter; IOPaint README; Pixa llms.txt; rembg README; ComfyUI README.

### 6.2 Pipelines / multi-step workflows (no-code)
Chain operations into a re-runnable pipeline saved as a preset; node/graph editor or linear step list.
- **Variants:**
  - Linear chained pipeline saved and re-applied to single image or batch (SnapOtter Pipelines).
  - Node-based visual workflow editor with workflows embedded in PNG/WebP/FLAC metadata (ComfyUI; load by dropping the image back in).
  - Drag-and-drop AI pipeline builder integrated with ComfyUI (fal.ai Workflows).
  - Node graph chaining multiple models + LLM prompt-enhancement nodes (Runway Workflows).
  - Workflow Editor with custom-UI parameter exposure for non-graph users (InvokeAI).
- **Sources:** SnapOtter; ComfyUI README; fal.ai llms.txt; Runway product page; InvokeAI release notes.

### 6.3 Iterators and dynamic prompts
Iterate over collections, use wildcards / random-choice prompt syntax, and run sweeps with order-preserved output.
- **Variants:**
  - `{a|b|c}` random choice and `(token:1.2)` weighting (ComfyUI dynamic prompts).
  - Prompt wildcards (InvokeAI).
  - Order-preserved iteration (InvokeAI 6.12 fix).
  - Read prompts from file (InvokeAI CLI `--from_file`).
- **Sources:** ComfyUI README; InvokeAI release notes.

### 6.4 Smart caching
Re-run only the parts of a pipeline whose inputs changed — saves seconds-per-iteration during prompt tuning.
- **Sources:** ComfyUI README (smart caching across queued prompts).

### 6.5 Prompt-driven agent (natural-language orchestration)
Conversational interface where the user describes the goal and the system picks tools/models behind the scenes.
- **Variants:**
  - "No special prompting required" agent (Pixa).
  - Conversational AI agent integrating media generation tools (fal.ai AI Agent).
  - Runway Agent creative-partner UI.
- **Sources:** Pixa llms.txt; fal.ai llms.txt; Runway product page.

---

## 7. AI video generation

### 7.1 Text-to-video
Generate a 1–15s clip from a prompt; resolution and aspect ratio configurable.
- **Variants:**
  - Multi-model selector (Pixa: Kling, Hailuo, Seedance, Veo, Pixverse, Dream Machine, Sora 2; Runway Gen-4.5; xAI grok-imagine-video).
  - Native synchronized audio generation (xAI: music, SFX, ambient, dialogue, lip-synced singing).
  - Resolution capped 720p–1080p with duration × resolution pricing (xAI).
- **Sources:** Pixa llms.txt; Runway product page; xAI video gen docs (docs.x.ai/.../video/generation); fal.ai llms.txt.

### 7.2 Image-to-video
Animate a still image; first frame = input. Aspect ratio defaults to source unless overridden.
- **Sources:** Pixa llms.txt; xAI imagine docs; Runway Gen-4.5; fal.ai video models.

### 7.3 Video-to-video editing (transform)
Modify an existing video while preserving the rest of the scene — restyle, swap outfit, change lighting/time-of-day, remove background, remove objects, change backdrop, add dialogue, add performance.
- **Variants:**
  - 8.7s duration cap on edits, 720p output, aspect matches input (xAI grok-imagine-video).
  - Runway Aleph as the editing engine for all transforms above.
- **Sources:** xAI video docs; Runway product page (Aleph).

### 7.4 Video extension
Extend an existing clip by 2–10s, generating natural continuation.
- **Sources:** xAI video docs (extend 2–15s input by 2–10s).

### 7.5 Reference-guided video (character continuity)
Use multiple reference images (model + outfit + scene) to keep characters/styles consistent across a clip.
- **Sources:** xAI imagine docs; Runway product page.

### 7.6 Talking-head / lip-sync / character performance
Map a person's voice and facial performance onto any image or character; real-time conversational video agents.
- **Variants:**
  - Act-Two performance transfer (Runway).
  - Real-time conversational digital persona from a single image (Runway Characters / GWM-1 Avatars).
  - AI Avatar MultiTalk; p-video-avatar (fal.ai / Replicate).
- **Sources:** Runway product page; fal.ai llms.txt; Replicate docs.

### 7.7 Reels / short-form video creation
Mobile-first creation flow for short business videos (templates, captions, music).
- **Sources:** Pixa Reels Maker.

---

## 8. Asset management

### 8.1 Projects / designs persistence
Create, save, list, and organize multiple designs per user; reload editor state from server.
- **Variants:**
  - DB-backed projects with auth (Canva-clone Neon Postgres + Drizzle; kanvas Supabase + Prisma).
  - Local-first IndexedDB persistence with debounced auto-save (infinite-kanvas).
  - Self-hosted Files library / Workspace with multipart upload (SnapOtter).
- **Sources:** Canva-clone README; kanvas README; infinite-kanvas README; SnapOtter docs.

### 8.2 Gallery, boards, history
Browse generated outputs with metadata recall, group by attribute, drag thumbnails back into any image-input slot.
- **Variants:**
  - Boards system with rich metadata recall and drag-to-input (InvokeAI).
  - Virtual boards auto-grouping by date (InvokeAI).
  - Paged browsing toggle and arrow-key navigation (InvokeAI).
  - Public sharable prediction URLs (Replicate).
- **Sources:** InvokeAI release notes; Replicate docs.

### 8.3 Workflow / preset sharing
Save and share workflows or presets across users; workflows-in-images for click-to-load.
- **Variants:**
  - Workflows embedded in PNG/WebP/FLAC metadata (ComfyUI).
  - Save/load JSON workflows (ComfyUI, InvokeAI).
  - Pre-made App workflows ("Remove from Video," "Upscale Video," etc.) — Runway Apps.
- **Sources:** ComfyUI README; InvokeAI release notes; Runway product page.

### 8.4 Version control / immutable versioning
Every model or workflow push produces an immutable, reproducible artifact.
- **Sources:** Replicate docs (immutable version hashes; older versions remain runnable).

### 8.5 Sharing and collaboration
Public links for prediction artifacts; team workspaces with permissions.
- **Variants:**
  - Public prediction URLs (Replicate).
  - Multi-user accounts with admin vs. ordinary roles (InvokeAI experimental).
  - Team CRUD, RBAC, API-key scoping, audit log (SnapOtter).
  - Organizations with shared models/API tokens/billing/dashboards (Replicate, fal.ai).
- **Sources:** Replicate docs; InvokeAI release notes; SnapOtter docs; fal.ai llms.txt.

### 8.6 Image utilities (compare, dedupe, palette, QR, barcode, base64)
Side-by-side compare, duplicate/near-duplicate detection, color-palette extraction, styled QR generation with embedded logo, barcode read, image→base64 inline encoding, image-info inspection.
- **Sources:** SnapOtter Utilities tools.

---

## 9. Performance & infrastructure

### 9.1 Local / on-device inference
Run all generation and editing locally without cloud calls. Privacy-preserving and compliance-friendly.
- **Variants:**
  - In-browser ONNX + WASM with offline cache (imgly).
  - Self-hosted Docker / single-container deploy (SnapOtter, IOPaint, InvokeAI).
  - Multi-vendor GPU: NVIDIA CUDA, AMD ROCm, Intel Arc xpu, Apple Silicon MPS, Ascend NPU, Cambricon MLU, Iluvatar Corex (ComfyUI).
  - CPU fallback / `--cpu` mode for GPU-less machines (ComfyUI, SnapOtter, IOPaint).
  - Air-gapped capable (SnapOtter).
- **Sources:** imgly README; SnapOtter docs; IOPaint README; InvokeAI README; ComfyUI README.

### 9.2 Cloud inference with serverless GPUs
Globally distributed serverless GPU pool with zero cold starts and per-output billing.
- **Variants:**
  - fal Inference Engine (claims up to 10× diffusion speed; "fastest FLUX" guarantee).
  - Auto-scale-to-zero (Replicate, fal.ai).
  - Hardware selector per call: CPU, T4, L40S, 2×L40S, A100 80GB, 8×A100 (Replicate); H100/H200/B200/A100/A6000 reserved (fal Compute).
- **Sources:** fal.ai llms.txt; Replicate docs.

### 9.3 Smart memory and VRAM management
Run large models on small GPUs (≥1 GB VRAM) via automatic offload; configurable VRAM cache.
- **Sources:** ComfyUI README; InvokeAI release notes.

### 9.4 Streaming output (SSE)
Stream intermediate progress / partial outputs to the client; surfaces as gradually-refining canvas previews.
- **Variants:**
  - SSE prediction stream (Replicate).
  - Streaming endpoints (fal.ai).
  - tRPC subscription with real-time canvas update (infinite-kanvas + fal.ai).
  - SSE per-file progress events for long-running tools (SnapOtter).
  - Latent previews (TAESD) during sampling (ComfyUI).
- **Sources:** Replicate docs; fal.ai llms.txt; infinite-kanvas README; SnapOtter release notes; ComfyUI README.

### 9.5 Async job model with polling and webhooks
Queue async generations; receive completion via polling `request_id` or webhook callbacks.
- **Variants:**
  - `request_id` polling with SDK auto-poll (xAI video).
  - `fal.subscribe` with progress callbacks (fal.ai).
  - Replicate webhook lifecycle events with verification and testing tools.
  - Session queue with reliable persistence (InvokeAI).
- **Sources:** xAI video docs; fal.ai llms.txt; Replicate docs (webhooks); InvokeAI release notes.

### 9.6 Rate limiting and quotas
Per-account and per-key throttles, tiered policies, anonymous tier with per-min/per-hour/per-day caps.
- **Variants:**
  - Three-tier rate limit for users without an API key (infinite-kanvas).
  - Bring-your-own API key to bypass app-level limits (infinite-kanvas).
  - Bot protection via BotId integration (infinite-kanvas).
  - Tiered policies (fal.ai, Replicate).
- **Sources:** infinite-kanvas README; fal.ai llms.txt; Replicate docs.

### 9.7 Web Worker offload
Run heavy canvas operations off the main thread for responsive UI.
- **Sources:** @anu3ev WorkerManager README.

### 9.8 Object caching and rendering performance
Per-shape offscreen canvas cache, layer partitioning (static vs. dynamic), `listening(false)` to skip hit detection, batch draws, `perfectDrawEnabled(false)`.
- **Sources:** Konva docs; Fabric.js docs.

### 9.9 Dedicated deployments and clusters
Long-lived, scaled, monitored deployments for production traffic; reserved on-demand GPU VMs for fine-tuning.
- **Sources:** Replicate docs (Deployments); fal.ai llms.txt (fal Compute reserved/hourly H100s from ~$1.2/hr).

### 9.10 Observability
Logging, metrics, monitoring per-prediction and per-deployment dashboards; usage analytics; admin audit log.
- **Sources:** Replicate docs; fal.ai llms.txt; SnapOtter audit log.

### 9.11 Data retention and secrets
Configurable retention, encrypted prediction-input secrets for sensitive params, per-account DB-backed cleanup settings.
- **Sources:** Replicate docs (Secrets, data retention); SnapOtter cleanup settings.

---

## 10. Developer / integration

### 10.1 REST API + OpenAPI
HTTP API exposing every tool/model; OpenAPI 3.1 spec; Scalar or built-in docs UI.
- **Variants:**
  - Every tool exposed via HTTP with OpenAPI spec (SnapOtter, IOPaint FastAPI).
  - Universal proxy `fal.run/<model-id>` (fal.ai).
  - First-class `Prediction` object with input/output files (Replicate).
  - REST endpoint to set all generation params programmatically (InvokeAI).
  - Pixelcut API endpoints: Background Remover, Image Upscaler, Background Generator, Try-On.
  - Runway API for image/video generation.
  - xAI `api.x.ai/v1` with image/video gen, edit, understanding.
- **Sources:** SnapOtter docs; IOPaint README; fal.ai llms.txt; Replicate docs; InvokeAI release notes; Pixa /api page; runwayml.com/api; docs.x.ai.

### 10.2 SDKs (multi-language)
First-party client libraries plus OpenAI-SDK compatibility for easy migration.
- **Variants:**
  - JS, Python, Swift, cURL, OpenAPI (fal.ai).
  - Python, Node.js, Go, Swift, MCP, plus OpenAI-SDK-compatible (Replicate).
  - `xai-sdk` (Python), `@ai-sdk/xai` (Vercel AI SDK), OpenAI-SDK compat (xAI).
- **Sources:** fal.ai llms.txt; Replicate docs; xAI docs.

### 10.3 Webhooks
Async lifecycle callbacks with verify/test helpers.
- **Sources:** Replicate docs (Webhooks section); fal.ai llms.txt (implied via queue/streaming).

### 10.4 MCP server (Model Context Protocol)
Native MCP server for use from Claude Desktop, Cursor, Claude Code.
- **Sources:** Replicate docs (MCP server).

### 10.5 Custom model upload / hosting
Bring-your-own-weights with packaging tooling and CI.
- **Variants:**
  - Cog packaging (`cog.yaml` + `predict.py`) with GitHub Actions push (Replicate).
  - Push directly from Hugging Face Transformers/Diffusers (Replicate).
  - `torch.compile` and Pruna AI compression guides (Replicate).
  - Private fine-tuned endpoints with bring-your-own-weights (fal.ai).
  - Custom-kernel inference for enterprise (fal.ai).
- **Sources:** Replicate docs; fal.ai llms.txt.

### 10.6 Custom node / plugin ecosystem
Add user-built nodes/plugins to extend the pipeline without forking.
- **Sources:** ComfyUI README (ComfyUI-Manager); IOPaint plugin list.

### 10.7 Auth, RBAC, API keys
Login, OAuth, enterprise SSO, scoped tokens.
- **Variants:**
  - API keys, OAuth, enterprise SAML/OIDC SSO (fal.ai).
  - API tokens with scoping and rotation (Replicate).
  - Email + Google + GitHub OAuth via Auth.js (Canva-clone).
  - Lucia Auth (kanvas).
  - Multi-user RBAC with admin/editor/custom roles and API-key scoping (SnapOtter).
  - Per-user accounts with separate galleries / canvas state (InvokeAI multi-user).
- **Sources:** fal.ai llms.txt; Replicate docs; Canva-clone README; kanvas README; SnapOtter docs; InvokeAI release notes.

### 10.8 Billing / subscriptions
Pay-as-you-go, prepaid credits, Stripe-style subscriptions with paywall.
- **Variants:**
  - Pay-per-use / pay-per-second / per-output (fal.ai, Replicate).
  - Credit-based for AI generations on top of subscription (Pixa Pro).
  - Stripe subscription billing with pro paywall (Canva-clone).
- **Sources:** Pixa llms.txt; fal.ai llms.txt; Replicate docs; Canva-clone README.

### 10.9 Playground / sandbox
Web UI per model for prompt testing without writing code.
- **Sources:** fal.ai llms.txt; Replicate docs (Playground).

### 10.10 Localization (i18n)
Multi-language UI shell. Required for any global rollout.
- **Variants:**
  - Native i18n in EN/ZH/RU/JA/KO/AR (ComfyUI).
  - Weblate localization pipeline (InvokeAI).
- **Sources:** ComfyUI README; InvokeAI README.

### 10.11 Desktop / mobile distribution
Native installers and stores.
- **Variants:**
  - Cross-platform Launcher: Windows EXE, macOS DMG, Linux AppImage (InvokeAI).
  - Windows 1-click installer (IOPaint).
  - Desktop apps (ComfyUI Desktop, comfy-cli, Windows portable).
  - Web + iOS + Android (Pixa).
  - Mobile-first iOS/Android consumer app (Grok Imagine).
- **Sources:** InvokeAI release notes; IOPaint README; ComfyUI README; Pixa llms.txt; xAI news.

### 10.12 Built-in safety toggles
Safety checker on by default with documented opt-out; NSFW toggles.
- **Variants:**
  - SDXL-family safety checker can be disabled with caveats (Replicate).
  - NSFW toggle (InvokeAI).
  - Region-gated "Spicy mode" (Grok Imagine consumer app only — not in public API).
- **Sources:** Replicate docs; InvokeAI release notes; xAI news.

---

## Cross-cutting concerns

**Licensing constraints to flag for legal review:**
- **AGPL-3.0**: `@imgly/background-removal`, `@imgly/background-removal-node`, and **SnapOtter** are AGPLv3. Any closed-source SaaS distribution (network use included) triggers AGPL obligations or requires a commercial license from img.ly / SnapOtter Enterprise.
- **GPL-3.0**: **ComfyUI** itself is GPL-3.0. Embedding ComfyUI as the backend behind a proprietary frontend is fine for self-hosted users; reselling a hosted product needs careful review of "conveyance" semantics — most teams treat it as compatible with SaaS but should consult counsel.
- **FLUX.1 [dev] / Fill [dev]**: Non-Commercial License. Production commercial use requires **Flux Fill `[pro]`** via the BFL API (or a paid licensing arrangement). Do **not** ship `[dev]` weights inside a commercial product.
- **CodeFormer**: S-Lab License — research/non-commercial; verify before shipping into a paid product.
- **IOPaint**: Apache-2.0 but the repo is **archived (Aug 13, 2025)**. Frozen at v1.5.3 (Nov 2024). Future security patches are on the integrating team.
- **Apache-2.0 / MIT / BSD-3-Clause**: InvokeAI, Fabric.js, Konva.js, @anu3ev, infinite-kanvas, kanvas, LaMa, GFPGAN, SAM 2, Real-ESRGAN, U²-Net, rembg — permissive, safe to embed.
- **xAI Aurora outputs**: May carry a "GROK" watermark (model-dependent); commercial use is allowed per xAI ToS but check current terms before shipping.

**Reproducibility and supply-chain notes:**
- Replicate's immutable model-version hashes are the gold standard for reproducible inference and should be mirrored when designing internal model storage.
- Workflows-in-image-metadata (ComfyUI PNG/WebP/FLAC embed) is a notable UX pattern worth replicating: any generated artifact is also its own re-runnable workflow.
- ICC color profile preservation is non-default in many open-source pipelines (IOPaint fixed this only late in its life). Plan for it from day one.

**Privacy posture:**
- True local/on-device pipelines are differentiated by imgly (browser WASM), SnapOtter (self-hosted Docker), and InvokeAI/ComfyUI (self-hosted). Pixa and Runway are cloud-only by design.

---

## Gaps and open questions

These features were either weakly documented across all sources or are reasonable to want but not covered well enough to scope from research alone. Flag for product/design decisions:

1. **Real-time multi-user collaborative editing** (Figma-style cursors, presence, CRDT). No surveyed editor ships this; Canva-clone and SnapOtter offer multi-user accounts but not co-editing on the same canvas.
2. **Mobile-first touch gestures** in the editor canvas. Fabric v6 has partial touch support; Konva has multi-touch; the rest lean desktop. PRD should specify gesture set explicitly (pinch-zoom, two-finger pan, long-press select).
3. **Vector editing (Bezier nodes, path operations)**. Fabric/Konva render paths but do not expose a Boolean / pathfinder-style editor (union, subtract, intersect). Not present in any surveyed source.
4. **Color management (ICC profiles end-to-end, wide-gamut display rendering)**. IOPaint added ICC preservation late; no other source documents it. Need explicit scope decision.
5. **Print-grade export (CMYK, 300 DPI presets, bleed/crop marks)**. None of the surveyed sources cover this; all assume RGB/screen.
6. **Accessibility (keyboard-only editor navigation, ARIA on canvas surfaces, color-contrast checks)**. SnapOtter has color-blindness *simulation* but nobody documents accessibility of the editor UI itself.
7. **Audit + compliance hooks (SOC2 evidence export, prompt/output logging for review)**. fal.ai and Replicate claim SOC 2; no editor exposes per-action immutable audit trails the way SnapOtter does for admin actions.
8. **Provenance / C2PA content credentials**. Increasingly required for AI-generated media; not mentioned by any source. Worth explicit PRD decision.
9. **Custom safety policies / per-team content filters**. Surveyed sources offer a binary safety toggle; no granular policy engine (allowlists, banned tokens, per-team rules).
10. **3D / depth-aware editing** (parallax, relight from depth, normal-map-aware retouch). ComfyUI has Hunyuan3D nodes and fal.ai lists 3D models, but no editor surfaces this as a user feature.
11. **Audio editing inside the same surface** (lip-sync, voice-over, music bed). fal.ai/Replicate expose audio models; only Runway integrates them into a unified editor. If the Pixa-style app targets short-form video, this is a likely-needed feature not covered by canvas/editor sources.
12. **Provenance-preserving "non-destructive" raster edits** (Lightroom-style edit stack vs. baked PNG output). All raster editors in the survey bake edits on commit; only InvokeAI's layered canvas approximates this. Worth deciding upfront whether the app stores edit DAGs or output bytes.