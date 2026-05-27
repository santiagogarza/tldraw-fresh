import { TLCanvasMode } from './modes'

/** @public */
export function applyCanvasModeStyles(container: HTMLElement, mode: TLCanvasMode) {
	container.setAttribute('data-canvas-mode', mode.id)
}
