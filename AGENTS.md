# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Core rules

- Use `yarn`, not `npm`, for repo commands. This repo uses Yarn workspaces and Yarn 4.
- Run commands from the repo root unless a command explicitly says to run from a workspace.
- Never run bare `tsc`; use `yarn typecheck` from the repo root.
- Prefer targeted checks first. Avoid repo-wide test or e2e runs unless the change needs them.
- Keep changes scoped to the request and the affected package. Do not refactor unrelated code.
- Respect existing worktree changes. Do not revert user changes unless explicitly asked.
- Prefer editing existing files over creating new files. Do not add new documentation files unless requested.
- Use sentence case for headings, titles, labels, and documentation text.

## Repo overview

This is the tldraw monorepo, an infinite canvas SDK for React applications. It is organized with Yarn workspaces.

Core packages:

- `packages/editor` - foundational infinite canvas editor with no default shapes, tools, or UI
- `packages/tldraw` - complete SDK with default UI, shapes, tools, and interactions
- `packages/store` - reactive client-side database, persistence, and migrations
- `packages/tlschema` - shape, binding, and record type definitions and validators
- `packages/state` - reactive signals library
- `packages/sync` and `packages/sync-core` - multiplayer sync packages
- `packages/utils` and `packages/validate` - shared utilities and validation helpers
- `packages/assets` - icons, fonts, translations, and bundled assets

Apps and examples:

- `apps/examples` - SDK examples and demos; the main place for example development
- `apps/docs` - documentation site at tldraw.dev
- `apps/dotcom` - tldraw.com app and workers
- `apps/vscode` - VS Code extension
- `templates` - starter templates for supported frameworks

## Setup

Requires Node `^20.0.0`. Enable Corepack before installing dependencies:

```bash
npm i -g corepack && yarn
```

## Common commands

Development:

- `yarn dev` - start the examples app at localhost:5420
- `yarn dev-app` - start the tldraw.com client app
- `yarn dev-docs` - start the docs site
- `yarn dev-vscode` - start VS Code extension development
- `yarn dev-template <template name>` - run a template

Build:

- `yarn build` - build all changed packages incrementally
- `yarn build-package` - build SDK packages only
- `yarn build-app` - build the tldraw.com client app
- `yarn build-docs` - build the docs site

Testing:

- `yarn test` in a workspace - run tests in watch mode
- `yarn test run` in a workspace - run tests once
- `yarn test run --grep "pattern"` in a workspace - run matching tests
- `yarn vitest` - run all tests across the repo; slow, avoid unless necessary
- `yarn e2e` - run examples e2e tests
- `yarn e2e-dotcom` - run tldraw.com e2e tests

Code quality:

- `yarn lint` - lint the package or workspace
- `yarn lint-current` - lint changed files
- `yarn typecheck` - type check all packages and refresh assets
- `yarn format` - format the repo
- `yarn format-current` - format changed files
- `yarn api-check` - validate public API reports

## Validation workflow

- For narrow package changes, run the relevant workspace test first, for example `cd packages/tldraw && yarn test run --grep "SelectTool"`.
- For changes that affect shared types, migrations, editor behavior, or cross-package contracts, run `yarn typecheck` from the repo root.
- For public API changes, run `yarn api-check` and include intentional API report updates.
- For asset changes, run `yarn refresh-assets` or `yarn typecheck` so generated assets stay current.
- For docs changes, run the narrow docs checks or docs build only when the change affects generated content, MDX behavior, or site structure.
- For e2e behavior changes, run the smallest relevant e2e suite and update snapshots only when behavior intentionally changed.

## Architecture notes

Reactive state:

- State is managed through `@tldraw/state` signals (`Atom`, `Computed`, and related primitives).
- Editor state is observable and dependency-tracked. Avoid bypassing existing reactive patterns.

Shapes:

- Shape behavior lives in `ShapeUtil` classes.
- Shape utils define geometry, rendering, handles, interactions, and SVG/export behavior.
- Add custom shape behavior through the established ShapeUtil patterns rather than one-off editor patches.

Tools:

- Tools are `StateNode` state machines.
- Complex tools use child states for pointer, keyboard, tick, and transition behavior.
- Keep interaction logic close to the tool state that owns it.

Bindings:

- Shape relationships use binding records and `BindingUtil` classes.
- Arrows and other connected shapes should update through binding utilities, not ad hoc shape mutation.

Store and schema:

- Store changes should respect migrations, validators, and schema versioning.
- Schema-affecting changes usually need updates in `packages/tlschema` and focused migration tests.

## Where to work

- Use `packages/editor` for core editor primitives, geometry, managers, and UI-free behavior.
- Use `packages/tldraw` for default shapes, default tools, UI, and integration tests that need the full SDK.
- Use `apps/examples` for runnable SDK examples and demonstrations.
- Use `apps/docs/content` for documentation articles and release notes.
- Use `apps/dotcom/client` for tldraw.com frontend behavior.
- Use `apps/dotcom/*-worker` for Cloudflare worker behavior.
- Use `templates` for starter project changes.

## Testing guidance

- Unit tests live alongside source files as `*.test.ts`.
- Integration tests commonly live in `packages/tldraw/src/test/`.
- E2E tests live in `apps/examples/e2e/` and `apps/dotcom/client/e2e/`.
- Test in `packages/tldraw` when default shapes, tools, bindings, or UI are involved.
- Test in `packages/editor` for core editor behavior that should not depend on default shapes or UI.
- Prefer comparing whole objects in assertions when that gives a clearer failure than checking fields one by one.
- See `skills/write-unit-tests/` and `skills/write-e2e-tests/` for detailed test patterns.

## Documentation and examples

- Docs live in `apps/docs/content/`.
- Examples live in `apps/examples/src/examples/`.
- Example folders use lowercase kebab-case names.
- Example README frontmatter drives the examples site; keep titles and descriptions sentence case.
- Update docs or examples when an API or user-facing behavior changes.
- See `skills/write-docs/`, `skills/write-example/`, and `skills/write-release-notes/` for task-specific guidance.

## Skills

- Canonical agent skills live in `skills/`.
- `.agents/skills` is a symlink to `../skills` for generic agent compatibility.
- `.claude/skills` is a symlink to `../skills` for Claude compatibility. Keep `skills/` as the source of truth.
- `.cursor/skills` is a symlink to `../skills` for Cursor compatibility.
- Skill folders use `skill-name/SKILL.md` with YAML frontmatter containing at least `name` and `description`.
- Put reusable scripts, references, and assets inside the relevant skill folder.
- Do not duplicate skill content for different agents; add compatibility pointers or symlinks instead.
- See `skills/skill-creator/` before creating or restructuring skills.
- User-facing workflow skills include `skills/pr/`, `skills/issue/`, `skills/take/`, `skills/commit-changes/`, and `skills/clean-copy/`.

## Code conventions

TypeScript:

- Follow existing file-local style and abstractions.
- Use workspace types and helpers rather than duplicating definitions.
- Keep public API changes deliberate and reflected in API reports.
- Avoid boolean or ambiguous positional options in new APIs when a named object or enum would make call sites clearer.

React and UI:

- Follow existing component patterns in the relevant app or package.
- Keep user-facing text concise and sentence case.
- Avoid broad UI rewrites when a focused component change is enough.

Generated files:

- Do not hand-edit generated assets, API reports, or schemas unless the repo already expects that file to be edited directly.
- Run the owning generator command when generated output needs to change.

Dependencies:

- Keep dependencies workspace-appropriate.
- If changing dependency manifests or lockfiles, make sure the lockfile update is intentional and included.

## Writing style

- Use sentence case for Markdown headings, UI labels, docs titles, PR titles, and issue titles.
- Capitalize proper nouns, acronyms, and code names normally, for example `PostgreSQL`, `WebSocket`, and `NodeShapeUtil`.
- Use direct, concrete language.
- Do not include AI attribution in commits, PR descriptions, issues, docs, release notes, or generated written content.

## Git and PR notes

- Keep commits focused when asked to commit.
- Use semantic PR titles for pull requests: `<type>(<scope>): <description>`.
- Never add yourself or an AI tool as a co-author.
- See `skills/pr/` and `skills/issue/` for GitHub workflows, and `skills/write-pr/` and `skills/write-issue/` for repository content standards.

## Cursor Cloud specific instructions

- Dependencies are installed by the startup update script (`corepack enable` then `yarn install`). You normally do not need to reinstall.
- Yarn 4 only works after `corepack enable`; if `yarn` reports the wrong version in a fresh shell, run `corepack enable` first. The cloud VM ships Node 22, which works fine even though `engines` says `^20` and CI pins 24.13.1.
- Primary dev experience: `yarn dev` (from repo root) serves the examples app at http://localhost:5420 and also starts `apps/bemo-worker` (http://localhost:8989) and `apps/dotcom/image-resize-worker` (http://localhost:8786). This is the main loop for SDK work and needs no secrets.
- The wrangler workers print `Unable to fetch the Request.cf object` / `read ECONNRESET` warnings on startup because the VM has no Cloudflare network access. These are non-fatal — the workers still report "Ready" and serve locally.
- `yarn install` logs a build failure for `@modelcontextprotocol/ext-apps` (`setup-bun.mjs ... failed or not available`). This is non-fatal and only affects the optional `apps/mcp-app`; the install completes with `Done with warnings`.
- The `apps/dotcom/*` stack (tldraw.com) is NOT runnable here without setup: it needs Clerk auth keys, a Postgres database via Docker (`apps/dotcom/zero-cache` runs `docker compose`), and several Cloudflare workers. See `apps/dotcom/README.md`. Use the examples app for canvas/SDK verification instead.
- `yarn typecheck` uses the native `tsgo` type checker and is fast; standard lint/test/build commands are documented above under "Common commands".
