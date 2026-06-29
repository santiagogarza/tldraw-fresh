---
title: Note reactions
component: ./NoteReactionsExample.tsx
priority: 10
keywords: [note, reactions, emoji, persistence, sticky]
---

Add emoji reactions to sticky notes.

---

Hover a sticky note to reveal a smiley button. Click it to pick from five emoji reactions. Reactions stack into a condensed pill at the lower-left, and hovering the pill expands a list showing who reacted plus a picker row for toggling your own reaction.

Reactions are persisted to the document via the `reactions` prop on the default `note` shape, so reloading restores them.
