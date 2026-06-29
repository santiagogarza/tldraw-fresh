---
title: Note reactions
component: ./NoteReactionsExample.tsx
priority: 10
keywords: [note, reactions, emoji, persistence, sticky]
---

Add emoji reactions to sticky notes that persist across reloads.

---

This example extends the default note shape with a persisted `reactions` field. Hover over a note to reveal a reactions control at its lower left: empty notes show a smiley button that opens an emoji picker, and notes with reactions show a condensed pill that expands to reveal who reacted. Reactions are stored in the shape props and persist via `persistenceKey`, so they survive a page reload.
