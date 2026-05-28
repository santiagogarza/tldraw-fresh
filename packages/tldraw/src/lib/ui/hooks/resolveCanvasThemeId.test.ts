import { describe, expect, it } from 'vitest'
import { resolveCanvasThemeId } from './resolveCanvasThemeId'

const BUILTIN_THEME_IDS = ['default', 'sky', 'sunrise', 'sunset'] as const

describe('resolveCanvasThemeId', () => {
	it('returns the theme id when it is registered', () => {
		expect(resolveCanvasThemeId('sunrise', BUILTIN_THEME_IDS)).toBe('sunrise')
		expect(resolveCanvasThemeId('sky', BUILTIN_THEME_IDS)).toBe('sky')
	})

	it('falls back to default for unknown theme ids', () => {
		expect(resolveCanvasThemeId('ocean', BUILTIN_THEME_IDS)).toBe('default')
		expect(resolveCanvasThemeId('typo-theme', BUILTIN_THEME_IDS)).toBe('default')
	})

	it('falls back to default for null, undefined, and empty string', () => {
		expect(resolveCanvasThemeId(null, BUILTIN_THEME_IDS)).toBe('default')
		expect(resolveCanvasThemeId(undefined, BUILTIN_THEME_IDS)).toBe('default')
		expect(resolveCanvasThemeId('', BUILTIN_THEME_IDS)).toBe('default')
	})

	it('falls back to default when no themes are registered', () => {
		expect(resolveCanvasThemeId('sunrise', [])).toBe('default')
	})

	it('accepts custom themes when present in the registry', () => {
		const themeIds = ['default', 'sky', 'corporate']
		expect(resolveCanvasThemeId('corporate', themeIds)).toBe('corporate')
	})
})
