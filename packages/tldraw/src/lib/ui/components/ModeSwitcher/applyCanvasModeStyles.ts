import { type TLCanvasMode } from './modes'

const CANVAS_MODE_STYLE_PROPS = [
	'--tl-canvas-mode-background',
	'--tl-canvas-mode-swatch',
	'--tl-color-background',
	'--tl-color-primary',
	'--tl-color-selected',
	'--tl-color-selection-stroke',
]

function getSolidBackground(background: string) {
	return background.match(/#[0-9a-f]{6}\b/i)?.[0] ?? background
}

export function applyCanvasModeStyles(container: HTMLElement, mode: TLCanvasMode) {
	container.setAttribute('data-canvas-mode', mode.id)
	container.style.setProperty('--tl-canvas-mode-background', mode.background)
	container.style.setProperty('--tl-canvas-mode-swatch', mode.swatch)
	container.style.setProperty('--tl-color-background', getSolidBackground(mode.background))
	container.style.setProperty('--tl-color-primary', mode.accent)
	container.style.setProperty('--tl-color-selected', mode.accent)
	container.style.setProperty('--tl-color-selection-stroke', mode.accent)

	return () => {
		if (container.getAttribute('data-canvas-mode') === mode.id) {
			container.removeAttribute('data-canvas-mode')
		}
		for (const prop of CANVAS_MODE_STYLE_PROPS) {
			container.style.removeProperty(prop)
		}
	}
}
