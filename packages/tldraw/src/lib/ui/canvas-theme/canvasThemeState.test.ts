import { deleteFromLocalStorage, setInLocalStorage } from '@tldraw/editor'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CANVAS_THEME_ID } from './canvasThemeDefinitions'
import { getCanvasTheme, resetCanvasThemeFromStorage, setCanvasTheme } from './canvasThemeState'

const STORAGE_KEY = 'TLDRAW_CANVAS_THEME_v1'

describe('canvasThemeState', () => {
	beforeEach(() => {
		deleteFromLocalStorage(STORAGE_KEY)
		setCanvasTheme(DEFAULT_CANVAS_THEME_ID)
	})

	afterEach(() => {
		deleteFromLocalStorage(STORAGE_KEY)
	})

	it('defaults to light when storage is empty', () => {
		deleteFromLocalStorage(STORAGE_KEY)
		resetCanvasThemeFromStorage()
		expect(getCanvasTheme()).toBe('light')
	})

	it('persists and reads back each mode id', () => {
		const ids = ['light', 'dark', 'sky', 'sunrise', 'sunset'] as const
		for (const id of ids) {
			setCanvasTheme(id)
			expect(getCanvasTheme()).toBe(id)
		}
	})

	it('falls back to light for invalid stored values', () => {
		setInLocalStorage(STORAGE_KEY, 'invalid-theme-id')
		resetCanvasThemeFromStorage()
		expect(getCanvasTheme()).toBe('light')
	})
})
