---
name: Clinical Precision
colors:
  surface: '#f6f9ff'
  surface-dim: '#d4dbe3'
  surface-bright: '#f6f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4fd'
  surface-container: '#e8eef7'
  surface-container-high: '#e2e9f1'
  surface-container-highest: '#dce3ec'
  on-surface: '#151c22'
  on-surface-variant: '#3d494d'
  inverse-surface: '#2a3138'
  inverse-on-surface: '#ebf1fa'
  outline: '#6d797e'
  outline-variant: '#bcc9ce'
  surface-tint: '#00677d'
  primary: '#00677d'
  on-primary: '#ffffff'
  primary-container: '#00b4d8'
  on-primary-container: '#00414f'
  inverse-primary: '#4cd6fb'
  secondary: '#315ca9'
  on-secondary: '#ffffff'
  secondary-container: '#86adff'
  on-secondary-container: '#033e8a'
  tertiary: '#006399'
  on-tertiary: '#ffffff'
  tertiary-container: '#58acee'
  on-tertiary-container: '#003e62'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b3ebff'
  primary-fixed-dim: '#4cd6fb'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5f'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#0f4490'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#94ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004b74'
  background: '#f6f9ff'
  on-background: '#151c22'
  surface-variant: '#dce3ec'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  code:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  gutter: 1rem
  container-max: 1440px
---

## Brand & Style

This design system is engineered for the high-stakes environment of dental practice management. The brand personality is rooted in clinical precision, reliability, and modern healthcare efficiency. It seeks to evoke a sense of calm and order for practitioners who manage complex schedules and patient data daily.

The chosen aesthetic is **Corporate / Modern** with a strong lean toward **Minimalism**. The interface prioritizes data density and legibility over decorative elements. It utilizes high-fidelity layouts for final production and a dedicated low-fidelity mode for rapid structural prototyping, ensuring the UX logic is sound before visual polish is applied.

## Colors

The palette is anchored by a vibrant Brand Cyan, representing modern dental technology, and a deep Navy Blue for professional authority. 

### High-Fidelity Mode
- **Primary (Cyan):** Used for primary actions, active states, and brand-building elements.
- **Secondary (Navy):** Reserved for side navigation backgrounds, primary headings, and high-level structural accents.
- **Surface Colors:** A range of ultra-light grays (#F8F9FA to #E9ECEF) are used to separate clinical data modules without creating visual noise.

### Low-Fidelity (Wireframe) Mode
When the design system is toggled to wireframe mode, all chromatic values are stripped. UI elements transition to a grayscale palette using strokes (#ADB5BD) and subtle fills (#E9ECEF). This ensures stakeholders focus on information architecture and workflow rather than aesthetic preference.

## Typography

This design system utilizes a dual-font approach to balance modern tech aesthetics with clinical utility. 

- **Manrope** is used for headlines. Its geometric but slightly softened terminals feel contemporary and approachable for patients while remaining professional.
- **Inter** is the workhorse for all body copy, data tables, and forms. Its tall x-height and exceptional legibility make it ideal for high-density medical interfaces.

In wireframe mode, typography remains consistent in scale but is rendered strictly in neutral dark grays to maintain the "blueprint" feel.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. The main application shell uses a fixed-width side navigation (240px) with a fluid content area that expands to fill the viewport, capped at a maximum container width for readability.

A strict 8px grid system governs all spatial relationships. 
- **Data Tables:** Use compact vertical spacing (sm) to maximize information visibility.
- **Forms:** Utilize generous margins (lg) between sections to prevent "form fatigue" during patient intake.
- **Wireframe View:** Grid lines and "X" placeholders for images should be visible to emphasize the structural layout.

## Elevation & Depth

To maintain a clinical and sterile feel, this design system avoids heavy, dark shadows. 

### High-Fidelity Depth
- **Tonal Layers:** Depth is primarily communicated through subtle background shifts (e.g., a light gray page background with white card surfaces).
- **Soft Shadows:** Only used for "floating" elements like modals or dropdown menus. These shadows are highly diffused with a low opacity (4-8%) and a slight navy tint to maintain color harmony.

### Low-Fidelity Depth
- **Strokes only:** Elevation is communicated via z-index stacking and 1px borders. No shadows are permitted in wireframe mode; instead, overlapping layers use a solid white fill to obscure elements behind them.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding provides a modern touch that feels more "human" than sharp corners, yet remains professional enough for a clinical environment.

- **Buttons & Inputs:** 4px (0.25rem) radius for a precise, "tooled" look.
- **Cards & Modals:** 8px (0.5rem) radius to define larger content areas.
- **Status Badges:** Fully rounded (pill-shaped) to distinguish them from actionable buttons or input fields.

## Components

### Side Navigation
The primary navigation resides on the left. In high-fidelity, it uses the Navy Blue background with white icons. In wireframe mode, it is a light gray block with 1px borders and placeholder icon squares.

### Data Tables
Tables are the heart of the management system. 
- Row heights are consistent (48px).
- Headers are styled using the `label-sm` token for clear categorization.
- In high-fidelity, alternate row striping is used; in wireframe mode, 1px horizontal dividers are used instead.

### Status Badges
Used for patient status (e.g., "Confirmed," "In Treatment," "Completed"). 
- High-Fidelity: Light background tints with dark text in the corresponding status color (e.g., light green background for Success).
- Wireframe: Solid black 1px stroke with grayscale text.

### Forms & Inputs
- Inputs must have clear, persistent labels using the `body-md` bold style.
- Error states are indicated by a 2px border in the Status Error color.
- Wireframe inputs use a simple "Input Placeholder" text string with a standard rectangle.

### Additional Components
- **Appointment Blocks:** Specialized card components for the calendar view, utilizing the shape and elevation rules to denote different treatment types.
- **Quick Action FAB:** A primary cyan button for "New Appointment" or "Add Patient," always positioned for easy access.