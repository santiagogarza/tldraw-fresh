import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
	CANVAS_THEME_DEFINITIONS,
	CANVAS_THEME_MODE_ORDER,
	CANVAS_THEME_MODE_STORAGE_KEY,
	getAllCanvasThemeOverrideKeys,
	getCanvasGradientForMode,
	getCssOverridesForMode,
	isCanvasThemeMode,
	readStoredCanvasThemeMode,
	writeStoredCanvasThemeMode,
} from './canvas-theme-modes'

const mockLocalStorage = (() => {
	let store: Record<string, string> = {}

	return {
		getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key]
		}),
		clear: vi.fn(() => {
			store = {}
		}),
		_reset: () => {
			store = {}
			vi.clearAllMocks()
		},
	}
})()

describe('isCanvasThemeMode', () => {
	it('returns true for every defined mode id', () => {
		for (const mode of CANVAS_THEME_MODE_ORDER) {
			expect(isCanvasThemeMode(mode)).toBe(true)
		}
	})

	it('returns false for null, empty string, and unknown values', () => {
		expect(isCanvasThemeMode(null)).toBe(false)
		expect(isCanvasThemeMode('')).toBe(false)
		expect(isCanvasThemeMode('ocean')).toBe(false)
		expect(isCanvasThemeMode('LIGHT')).toBe(false)
	})
})

describe('readStoredCanvasThemeMode', () => {
	beforeEach(() => {
		mockLocalStorage._reset()
		vi.stubGlobal('localStorage', mockLocalStorage)
	})

	it('returns stored mode when valid', () => {
		mockLocalStorage.setItem(CANVAS_THEME_MODE_STORAGE_KEY, 'sunset')
		expect(readStoredCanvasThemeMode()).toBe('sunset')
	})

	it('returns light when storage is empty', () => {
		expect(readStoredCanvasThemeMode()).toBe('light')
	})

	it('returns light when storage contains an invalid value', () => {
		mockLocalStorage.setItem(CANVAS_THEME_MODE_STORAGE_KEY, 'not-a-mode')
		expect(readStoredCanvasThemeMode()).toBe('light')
	})

	it('returns light when localStorage throws', () => {
		mockLocalStorage.getItem.mockImplementationOnce(() => {
			throw new Error('SecurityError')
		})
		expect(readStoredCanvasThemeMode()).toBe('light')
	})
})

describe('writeStoredCanvasThemeMode', () => {
	beforeEach(() => {
		mockLocalStorage._reset()
		vi.stubGlobal('localStorage', mockLocalStorage)
	})

	it('persists the mode under the storage key', () => {
		writeStoredCanvasThemeMode('sky')
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(CANVAS_THEME_MODE_STORAGE_KEY, 'sky')
		expect(mockLocalStorage.getItem(CANVAS_THEME_MODE_STORAGE_KEY)).toBe('sky')
	})

	it('swallows errors when localStorage throws', () => {
		mockLocalStorage.setItem.mockImplementationOnce(() => {
			throw new Error('QuotaExceededError')
		})
		expect(() => writeStoredCanvasThemeMode('dark')).not.toThrow()
	})
})

describe('getCssOverridesForMode', () => {
	it('returns light overrides for light color mode', () => {
		const definition = CANVAS_THEME_DEFINITIONS.sky
		expect(getCssOverridesForMode(definition, 'light')).toEqual(definition.cssOverridesLight)
	})

	it('returns dark overrides for dark color mode', () => {
		const definition = CANVAS_THEME_DEFINITIONS.sunrise
		expect(getCssOverridesForMode(definition, 'dark')).toEqual(definition.cssOverridesDark)
	})

	it('returns empty objects for default light and dark modes', () => {
		expect(getCssOverridesForMode(CANVAS_THEME_DEFINITIONS.light, 'light')).toEqual({})
		expect(getCssOverridesForMode(CANVAS_THEME_DEFINITIONS.dark, 'dark')).toEqual({})
	})
})

describe('getCanvasGradientForMode', () => {
	it('returns the light gradient when present', () => {
		const definition = CANVAS_THEME_DEFINITIONS.sunrise
		expect(getCanvasGradientForMode(definition, 'light')).toBe(definition.canvasGradientLight)
	})

	it('returns the dark gradient when present', () => {
		const definition = CANVAS_THEME_DEFINITIONS.sunset
		expect(getCanvasGradientForMode(definition, 'dark')).toBe(definition.canvasGradientDark)
	})

	it('returns undefined when the mode has no gradient for that color mode', () => {
		expect(getCanvasGradientForMode(CANVAS_THEME_DEFINITIONS.sky, 'light')).toBeUndefined()
		expect(getCanvasGradientForMode(CANVAS_THEME_DEFINITIONS.light, 'dark')).toBeUndefined()
	})
})

describe('getAllCanvasThemeOverrideKeys', () => {
	it('includes override keys from gradient modes and excludes duplicates', () => {
		const keys = getAllCanvasThemeOverrideKeys()

		expect(keys).toContain('tl-color-primary')
		expect(keys).toContain('tl-color-background')
		expect(keys).toContain('tl-color-selection-fill')

		const skyKeys = Object.keys(CANVAS_THEME_DEFINITIONS.sky.cssOverridesLight)
		for (const key of skyKeys) {
			expect(keys).toContain(key)
		}

		expect(new Set(keys).size).toBe(keys.length)
	})

	it('does not include keys from modes without css overrides', () => {
		const keys = getAllCanvasThemeOverrideKeys()
		const lightKeys = [
			...Object.keys(CANVAS_THEME_DEFINITIONS.light.cssOverridesLight),
			...Object.keys(CANVAS_THEME_DEFINITIONS.light.cssOverridesDark),
		]
		expect(lightKeys).toHaveLength(0)
		for (const key of lightKeys) {
			expect(keys).not.toContain(key)
		}
	})
})
