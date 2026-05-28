import { TLTheme, TLThemeColors } from '@tldraw/tlschema'
import { structuredClone } from '@tldraw/utils'
import { DEFAULT_THEME } from './defaultThemes'

function withColors(
	theme: TLTheme,
	patch: { light?: Partial<TLThemeColors>; dark?: Partial<TLThemeColors> }
): TLTheme {
	const next = structuredClone(theme)
	if (patch.light) {
		next.colors.light = { ...next.colors.light, ...patch.light }
	}
	if (patch.dark) {
		next.colors.dark = { ...next.colors.dark, ...patch.dark }
	}
	return next
}

const SKY_LIGHT: Partial<TLThemeColors> = {
	background: '#dbeafe',
	negativeSpace: '#dbeafe',
	selectionStroke: '#3b82f6',
	selectionFill: 'hsl(214, 84%, 56%, 24%)',
}

const SKY_DARK: Partial<TLThemeColors> = {
	background: '#0f172a',
	negativeSpace: '#0f172a',
	selectionStroke: '#60a5fa',
	selectionFill: 'hsl(214, 84%, 56%, 20%)',
}

export const SKY_THEME: TLTheme = withColors(
	(() => {
		const theme = structuredClone(DEFAULT_THEME)
		theme.id = 'sky'
		return theme
	})(),
	{ light: SKY_LIGHT, dark: SKY_DARK }
)

const SUNRISE_LIGHT: Partial<TLThemeColors> = {
	background: '#fce7f3',
	backgroundGradient: 'linear-gradient(135deg, #fce7f3 0%, #e9d5ff 100%)',
	negativeSpace: '#fce7f3',
	selectionStroke: '#db2777',
	selectionFill: 'hsla(330, 81%, 60%, 24%)',
}

const SUNRISE_DARK: Partial<TLThemeColors> = {
	background: '#3b1730',
	backgroundGradient: 'linear-gradient(135deg, #4a1942 0%, #2e1065 100%)',
	negativeSpace: '#3b1730',
	selectionStroke: '#f472b6',
	selectionFill: 'hsla(330, 81%, 60%, 20%)',
}

export const SUNRISE_THEME: TLTheme = withColors(
	(() => {
		const theme = structuredClone(DEFAULT_THEME)
		theme.id = 'sunrise'
		return theme
	})(),
	{ light: SUNRISE_LIGHT, dark: SUNRISE_DARK }
)

const SUNSET_LIGHT: Partial<TLThemeColors> = {
	background: '#fed7aa',
	backgroundGradient: 'linear-gradient(135deg, #fed7aa 0%, #fca5a5 100%)',
	negativeSpace: '#fed7aa',
	selectionStroke: '#ea580c',
	selectionFill: 'hsla(24, 95%, 53%, 24%)',
}

const SUNSET_DARK: Partial<TLThemeColors> = {
	background: '#431407',
	backgroundGradient: 'linear-gradient(135deg, #7c2d12 0%, #881337 100%)',
	negativeSpace: '#431407',
	selectionStroke: '#fb923c',
	selectionFill: 'hsla(24, 95%, 53%, 20%)',
}

export const SUNSET_THEME: TLTheme = withColors(
	(() => {
		const theme = structuredClone(DEFAULT_THEME)
		theme.id = 'sunset'
		return theme
	})(),
	{ light: SUNSET_LIGHT, dark: SUNSET_DARK }
)

/** Built-in canvas themes shipped with the SDK. */
export const BUILTIN_THEMES = {
	sky: SKY_THEME,
	sunrise: SUNRISE_THEME,
	sunset: SUNSET_THEME,
} as const
