import { getFromLocalStorage, setInLocalStorage } from '@tldraw/editor'
import { atom } from '@tldraw/state'
import { CanvasThemeId, DEFAULT_CANVAS_THEME_ID, isCanvasThemeId } from './canvasThemeDefinitions'

const STORAGE_KEY = 'TLDRAW_CANVAS_THEME_v1'

function readStoredCanvasTheme(): CanvasThemeId {
	const stored = getFromLocalStorage(STORAGE_KEY)
	if (stored && isCanvasThemeId(stored)) {
		return stored
	}
	return DEFAULT_CANVAS_THEME_ID
}

const canvasThemeAtom = atom<CanvasThemeId>('canvasTheme', readStoredCanvasTheme())

/** @public */
export function getCanvasTheme(): CanvasThemeId {
	return canvasThemeAtom.get()
}

/** @public */
export function setCanvasTheme(id: CanvasThemeId): void {
	setInLocalStorage(STORAGE_KEY, id)
	canvasThemeAtom.set(id)
}

/** @internal */
export function getCanvasThemeAtom() {
	return canvasThemeAtom
}

/** @internal */
export function resetCanvasThemeFromStorage() {
	canvasThemeAtom.set(readStoredCanvasTheme())
}
