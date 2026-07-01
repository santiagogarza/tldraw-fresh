import { useEditor } from '@tldraw/editor'
import { useEffect, useSyncExternalStore } from 'react'
import {
	CANVAS_THEME_STORAGE_KEY,
	type CanvasThemeMode,
	DEFAULT_CANVAS_THEME_MODE,
	isCanvasThemeMode,
	loadCanvasThemeMode,
} from './canvasThemeConstants'

const listeners = new Set<() => void>()
let currentMode: CanvasThemeMode = loadCanvasThemeMode()

function subscribe(listener: () => void) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

function getSnapshot() {
	return currentMode
}

function getServerSnapshot() {
	return DEFAULT_CANVAS_THEME_MODE
}

export function applyCanvasThemeToContainer(container: HTMLElement, mode: CanvasThemeMode) {
	container.setAttribute('data-canvas-theme', mode)
}

export function setCanvasThemeMode(mode: CanvasThemeMode) {
	if (mode === currentMode) return
	currentMode = mode
	try {
		localStorage.setItem(CANVAS_THEME_STORAGE_KEY, mode)
	} catch {
		// Ignore storage errors.
	}
	for (const listener of listeners) {
		listener()
	}
}

export function getCanvasThemeMode() {
	return currentMode
}

export function useCanvasTheme() {
	const editor = useEditor()
	const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

	useEffect(() => {
		applyCanvasThemeToContainer(editor.getContainer(), mode)
	}, [editor, mode])

	return { mode, setMode: setCanvasThemeMode }
}

export function useCanvasThemeMode() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function initCanvasThemeFromStorage(container: HTMLElement) {
	const mode = loadCanvasThemeMode()
	currentMode = mode
	applyCanvasThemeToContainer(container, mode)
	return mode
}

export function parseCanvasThemeMode(value: string | null): CanvasThemeMode {
	return isCanvasThemeMode(value) ? value : DEFAULT_CANVAS_THEME_MODE
}
