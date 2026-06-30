# Demo bug automation

Tooling for the "color change broken" Cursor Cloud agent demo. The flow
is:

1. The Slack automation triggers a cloud agent against this repo.
2. The cloud agent VM runs its environment setup script and ends up
   on a fresh branch (for example `cursor/tldraw-bug-reproduction-XXXX`).
3. The setup script invokes `scripts/demo-bug-automation/plant-color-bug.sh`,
   which applies `color-change-broken.patch` to the working tree as
   uncommitted changes.
4. The agent reproduces the bug, fixes it, commits, and pushes the
   designated branch so the PR-opening step can find it on origin.

The patch ignores `tldraw:color` inside
`Editor.setStyleForSelectedShapes`, so clicking a color swatch in the
style panel does nothing for selected shapes. Other styles (size,
fill, dash, font, opacity) keep working, and new shapes still pick up
the chosen color through `setStyleForNextShapes`.

## Files

- `color-change-broken.patch` — single-hunk diff against `main` that
  plants the bug in `packages/editor/src/lib/editor/Editor.ts`.
- `plant-color-bug.sh` — idempotent: applies the patch to the working
  tree if it is not already applied. Safe to invoke from a cloud
  agent setup script.
- `reset-demo-bug.sh` — restores `Editor.ts` from `HEAD` and reapplies
  the patch. Use this on a long-lived workspace to start a fresh demo
  run.

## Mirror branch on origin

`origin/santi-demo-bug-automation` mirrors `main + color-change-broken.patch`
as a single commit. Keep that branch in sync with the patch whenever
either side moves, so cloud agents that base off the branch and agents
that use the setup-script path see the same broken state.

## Hooking into the Cursor Cloud environment

The cloud agent environment setup commands live in the Cursor web
dashboard (Cloud Agents → Environment), not in this repo. Add a final
step to that setup script:

```bash
bash scripts/demo-bug-automation/plant-color-bug.sh
```

Run it after `yarn install` and any other build steps so the patched
state is what the agent actually sees when it starts working.
