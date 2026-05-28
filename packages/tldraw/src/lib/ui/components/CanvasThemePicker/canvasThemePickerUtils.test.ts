import { describe, expect, it } from 'vitest'
import { getActiveCanvasThemeMode, getCanvasThemePreferenceUpdate } from './canvasThemePickerUtils'

describe('getActiveCanvasThemeMode', () => {
	it('maps built-in theme ids directly to picker modes', () => {
		expect(getActiveCanvasThemeMode('sky', false)).toBe('sky')
		expect(getActiveCanvasThemeMode('sunrise', true)).toBe('sunrise')
		expect(getActiveCanvasThemeMode('sunset', false)).toBe('sunset')
	})

	it('maps default theme to light or dark based on color mode', () => {
		expect(getActiveCanvasThemeMode('default', false)).toBe('light')
		expect(getActiveCanvasThemeMode('default', true)).toBe('dark')
	})

	it('treats unknown theme ids as light/dark, not named modes', () => {
		expect(getActiveCanvasThemeMode('ocean' as 'default', false)).toBe('light')
		expect(getActiveCanvasThemeMode('ocean' as 'default', true)).toBe('dark')
	})
})

describe('getCanvasThemePreferenceUpdate', () => {
	it('sets color scheme and default theme for light mode', () => {
		expect(getCanvasThemePreferenceUpdate('light')).toEqual({
			userPreferences: { colorScheme: 'light', themeId: 'default' },
			editorThemeId: 'default',
		})
	})

	it('sets color scheme and default theme for dark mode', () => {
		expect(getCanvasThemePreferenceUpdate('dark')).toEqual({
			userPreferences: { colorScheme: 'dark', themeId: 'default' },
			editorThemeId: 'default',
		})
	})

	it('only updates themeId for sky, sunrise, and sunset (preserves color scheme)', () => {
		expect(getCanvasThemePreferenceUpdate('sky')).toEqual({
			userPreferences: { themeId: 'sky' },
			editorThemeId: 'sky',
		})
		expect(getCanvasThemePreferenceUpdate('sunrise')).toEqual({
			userPreferences: { themeId: 'sunrise' },
			editorThemeId: 'sunrise',
		})
		expect(getCanvasThemePreferenceUpdate('sunset')).toEqual({
			userPreferences: { themeId: 'sunset' },
			editorThemeId: 'sunset',
		})
	})
})
