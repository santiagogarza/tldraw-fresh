import { structuredClone } from '@tldraw/utils'
import { describe, expect, it } from 'vitest'
import { SKY_THEME, SUNRISE_THEME, SUNSET_THEME } from './builtinThemes'
import { resolveThemes } from './ThemeManager'

describe('builtin canvas themes', () => {
	it('includes sky, sunrise, and sunset in resolveThemes', () => {
		const themes = resolveThemes()
		expect(themes.sky).toEqual(SKY_THEME)
		expect(themes.sunrise).toEqual(SUNRISE_THEME)
		expect(themes.sunset).toEqual(SUNSET_THEME)
	})

	it('uses gradient backgrounds for sunrise and sunset', () => {
		expect(SUNRISE_THEME.colors.light.backgroundGradient).toBeDefined()
		expect(SUNSET_THEME.colors.light.backgroundGradient).toBeDefined()
	})

	it('uses solid sky backgrounds without gradients', () => {
		expect(SKY_THEME.colors.light.backgroundGradient).toBeUndefined()
	})

	it('keeps distinct light and dark palettes per built-in theme', () => {
		expect(SKY_THEME.colors.light.background).not.toBe(SKY_THEME.colors.dark.background)
		expect(SUNRISE_THEME.colors.light.background).not.toBe(SUNRISE_THEME.colors.dark.background)
	})

	it('lets consumer themes override built-in entries in resolveThemes', () => {
		const customSunset = structuredClone(SUNSET_THEME)
		customSunset.colors.light.background = '#111111'
		const themes = resolveThemes({ sunset: customSunset })
		expect(themes.sunset.colors.light.background).toBe('#111111')
	})
})
