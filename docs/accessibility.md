# Accessibility Specification (8-to-80 UX) — CAMPUS
*Ensuring seamless readability and operability across all ages, abilities, and devices.*

---

## The 8-to-80 Philosophy
University communities span teenagers entering college for the first time up to senior professors and administrators. Software must not assume 20/20 vision, steady fine-motor dexterity, or familiarity with cutting-edge tech jargon.

---

## 1. Contrast Ratios & Legibility
- **Text Contrast:** Meets WCAG 2.1 AA standards (minimum 4.5:1 for body copy, 7:1 for headers).
- **Dark Theme:** Avoids pure pitch-black against bright white to prevent halation and eye fatigue; uses deep navy slate (`#0B0E14` and `#151C2C`) with softened text tones (`#F3F4F6`).
- **Font Sizing:** Base root font size is scalable; never uses unscalable fixed pixel heights that break on 200% browser zoom.

---

## 2. Touch Targets & Motor Controls
- **Minimum Tap Target:** Strictly enforces `44px × 44px` minimum interactive bounds on mobile controls, bottom tabs, and action pills.
- **Generous Hit Areas:** Card clickables encompass the entire row rather than requiring precise targeting of a 12px chevron.

---

## 3. Keyboard Operability & Focus Architecture
- **Full Tab Traversal:** Visible focus rings (`outline: 2px solid var(--accent-blue)`) on all interactive nodes.
- **Escape Key Semantics:** Modals, drawers, and the `Ctrl + K` Command Palette close immediately upon pressing `Escape`.
- **Skip to Content:** Direct semantic anchors for screen readers to bypass repetitive navigation.

---

## 4. Cognitive Accessibility & Plain Language
- Avoids cryptic administrative codes (e.g. *“SEC-CS-L302-REG”* becomes *“Data Structures · Room B204”*).
- Clear, non-technical empty states: *“You're all caught up. No assignments due soon.”*
