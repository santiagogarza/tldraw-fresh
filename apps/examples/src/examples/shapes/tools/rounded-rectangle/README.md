---
title: Rounded rectangle with adjustable radius
component: ./RoundedRectangleExample.tsx
category: shapes/tools
priority: 4
keywords: [shape, custom, rectangle, rounded, corner, radius, handle]
---

A custom rectangle shape with an adjustable corner radius. Select a shape and drag the handle inside its top-left corner to go from very sharp to very rounded.

---

This example shows how to add per-shape geometry adjustments through a custom `ShapeUtil` and a single vertex handle. The shape stores its corner radius as a prop and exposes a handle at `(radius, radius)` inside the top-left corner. Dragging that handle projects the pointer position onto the diagonal from the corner toward the shape's centre and updates the radius, clamped to half the smaller side so the corners never overlap. The shape approximates the rounded outline with a polygon for accurate hit-testing and renders with an SVG `<rect rx ry>` so the browser draws the corners exactly.

The shape reuses the built-in color, fill, and size styles so it picks up the standard style panel, and it registers a `BaseBoxShapeTool` for creation with the toolbar and the `r` keyboard shortcut.
