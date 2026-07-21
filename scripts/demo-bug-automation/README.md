# Demo bug automation

Tooling for the planted-bug Cursor Cloud agent demos. The flow is:

1. The Slack automation triggers a cloud agent against this repo.
2. The cloud agent VM runs its environment setup script and ends up
   on a fresh branch (for example `cursor/tldraw-bug-reproduction-XXXX`).
3. The setup script invokes `scripts/demo-bug-automation/plant-color-bug.sh`,
   which applies every `*.patch` in this directory to the working tree
   as uncommitted changes.
4. The agent reproduces the bug, fixes it, commits, and pushes the
   designated branch so the PR-opening step can find it on origin.

Two bugs are planted:

- **`color-change-broken.patch`** ignores `tldraw:color` inside
  `Editor.setStyleForSelectedShapes`, so clicking a color swatch in the
  style panel does nothing for selected shapes. Other styles (size,
  fill, dash, font, opacity) keep working, and new shapes still pick up
  the chosen color through `setStyleForNextShapes`.
- **`star-upside-down.patch`** flips the star geo path vertically in
  `getGeoShapePath.ts`, so the Star shape (toolbar > More) renders
  upside down: one point at the bottom, two points at the top.
  (Replaced the old upside-down-heart bug, which looked slightly
  profane on stage.)

## One-command pre-flight

```bash
bash scripts/demo-bug-automation/setup-demo-bug.sh
```

That single command verifies the remote demo state, plants both bugs
in your working tree, pins node 20, runs `yarn install` if needed,
runs the lazy `predev` + `refresh-assets` prep, kills any stale
listener on `:5420`, starts Vite (`apps/examples`) in the background,
waits for the server to actually respond, and opens
`http://localhost:5420` in your browser.

Flags:

- `--check-only` — remote sanity check only, no local boot.
- `--reset` — also force-reset `origin/santi-demo-bug-automation`
  back to the `santi-demo-bug-v4` tag if it has drifted.
- `--port NNNN` — pick a different local port (default `5420`).
- `--no-open` — don't open the browser tab.

After the demo, tear down with:

```bash
bash scripts/demo-bug-automation/demo-local-down.sh           # stop vite
bash scripts/demo-bug-automation/demo-local-down.sh --reset   # stop vite + drop the planted patch
```

## Files

- `color-change-broken.patch` — single-hunk diff against `main` that
  plants the color bug in `packages/editor/src/lib/editor/Editor.ts`.
- `star-upside-down.patch` — single-hunk diff against `main` that
  flips the star path in
  `packages/tldraw/src/lib/shapes/geo/getGeoShapePath.ts`.
- `plant-color-bug.sh` — idempotent: applies every `*.patch` in this
  directory to the working tree if not already applied. Safe to invoke
  from a cloud agent setup script. (Name is historical — the Cloud
  Agent environment setup script invokes it by name.)
- `reset-demo-bug.sh` — restores the patch target files from `HEAD` and
  reapplies the patches. Use this on a long-lived workspace to start a
  fresh demo run.
- `setup-demo-bug.sh` — the one-command pre-flight described above.
- `demo-local-down.sh` — stop the background Vite server started by
  `setup-demo-bug.sh`. `--reset` also restores all patch targets from
  HEAD.

## Mirror branch on origin

`origin/santi-demo-bug-automation` mirrors `main + both patches` as a
single commit, tagged `santi-demo-bug-v4` (v4 = upside-down star replacing
the old heart bug). Keep that branch in sync
with the patches whenever either side moves, so cloud agents that base
off the branch and agents that use the setup-script path see the same
broken state.

This directory is committed on `main` (and therefore on the automation
branch too). That is what lets the Cloud Agent environment update
script find `plant-color-bug.sh` on a fresh checkout of any branch. Do
not remove it from `main`; the local demo-bug-kit copy in `~/work/demos`
is the editing source of truth and gets re-synced by the preflight.

## Hooking into the Cursor Cloud environment

The cloud agent environment update script lives in the Cursor web
dashboard (Cloud Agents → Environment), not in this repo. The
recommended script (hardened so the environment can never fail on a
branch that predates this kit):

```bash
corepack enable
yarn install
if [ -f scripts/demo-bug-automation/plant-color-bug.sh ]; then
  bash scripts/demo-bug-automation/plant-color-bug.sh || echo "warn: demo bug planting failed; continuing"
fi
```

Run the plant step after `yarn install` and any other build steps so
the patched state is what the agent actually sees when it starts
working. On the automation branch the bugs are already committed, so
the script prints "already planted" and exits 0.
