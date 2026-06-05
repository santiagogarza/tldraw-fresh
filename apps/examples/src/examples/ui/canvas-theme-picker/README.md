---
title: Canvas theme picker
component: ./CanvasThemePickerExample.tsx
priority: 0.5
keywords: [theme, picker, canvas, gradient, sky, sunrise, sunset, dark mode]
---

Switch between five canvas modes from a color swatch in the top-left menu bar.

---

This example adds a circular theme picker to the menu bar. Each mode updates the canvas background and UI accent colors. Sunrise and sunset use gradient backgrounds. The selected mode is stored in `localStorage` and restored on reload.

Modes:

- **Light mode** — default light appearance
- **Dark mode** — default dark appearance
- **Sky mode** — light blue canvas and accents
- **Sunrise mode** — pink and purple gradient
- **Sunset mode** — orange and red gradient

Sky, sunrise, and sunset follow the system color preference when you have not picked light or dark mode explicitly.
