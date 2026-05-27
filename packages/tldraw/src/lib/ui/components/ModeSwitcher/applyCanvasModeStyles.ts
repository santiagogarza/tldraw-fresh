import { TLCanvasMode, TLCanvasModeId } from './modes'

function getCanvasModeBackgroundColor(modeId: TLCanvasModeId): string {
	switch (modeId) {
		case 'light':
			return '#ffffff'
		case 'dark':
			return '#0e0e10'
		case 'sky':
			return '#cfe8ff'
		case 'sunrise':
			return '#ffd6e7'
		case 'sunset':
			return '#ff7e5f'
	}
}

/** @public */
export function applyCanvasModeStyles(container: HTMLElement, mode: TLCanvasMode) {
	container.dataset.canvasMode = mode.id
	container.style.setProperty('--tl-canvas-mode-background', mode.background)
	container.style.setProperty(
		'--tl-canvas-mode-background-color',
		getCanvasModeBackgroundColor(mode.id)
	)
	container.style.setProperty('--tl-canvas-mode-accent', mode.accent)
}

/** @public */
export function clearCanvasModeStyles(container: HTMLElement) {
	delete container.dataset.canvasMode
	container.style.removeProperty('--tl-canvas-mode-background')
	container.style.removeProperty('--tl-canvas-mode-background-color')
	container.style.removeProperty('--tl-canvas-mode-accent')
}
