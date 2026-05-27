import { TLCanvasMode } from './modes'

/**
 * Mark the given editor container element with the active canvas mode so that
 * the mode-specific CSS in `ui.css` (keyed off `[data-canvas-mode="..."]`) can
 * paint the canvas background and override accent colors.
 *
 * Scope is intentionally per-container so multiple editors on a page can each
 * carry their own mode. CSS variables and the `.tl-background` declaration are
 * declared once in `ui.css` rather than re-applied here.
 *
 * @public
 */
export function applyCanvasModeStyles(
	container: HTMLElement | null | undefined,
	mode: TLCanvasMode
): void {
	if (!container) return
	if (container.getAttribute('data-canvas-mode') !== mode.id) {
		container.setAttribute('data-canvas-mode', mode.id)
	}
}
