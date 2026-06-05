import { DEFAULT_THEME, structuredClone, TLTheme, TLThemeId, TLThemes } from 'tldraw'

export type CanvasThemeMode = 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset'

export const CANVAS_THEME_MODE_STORAGE_KEY = 'tldraw-canvas-theme-mode'

export const CANVAS_THEME_MODE_ORDER: CanvasThemeMode[] = [
	'light',
	'dark',
	'sky',
	'sunrise',
	'sunset',
]

export interface CanvasThemeModeDefinition {
	id: CanvasThemeMode
	name: string
	/** Fill for the toolbar swatch circle */
	swatchBackground: string
	themeId: TLThemeId
	/** When set, forces light or dark. Otherwise follows the system preference. */
	colorScheme?: 'light' | 'dark'
	/** CSS overrides for UI accent colors on `.tl-container` (light mode) */
	cssOverridesLight: Record<string, string>
	/** CSS overrides for UI accent colors on `.tl-container` (dark mode) */
	cssOverridesDark: Record<string, string>
	/** Gradient canvas backgrounds per color mode */
	canvasGradientLight?: string
	canvasGradientDark?: string
}

function cloneTheme(id: TLThemeId, customize: (theme: TLTheme) => void): TLTheme {
	const theme = structuredClone(DEFAULT_THEME)
	theme.id = id
	customize(theme)
	return theme
}

const SKY_THEME = cloneTheme('sky', (theme) => {
	const accent = '#3b8fd9'
	const accentDark = '#5aa8e8'
	for (const mode of ['light', 'dark'] as const) {
		const colors = theme.colors[mode]
		colors.background = mode === 'light' ? '#e8f4fc' : '#0f1a24'
		colors.negativeSpace = colors.background
		colors.selectionStroke = accent
		colors.selectionFill =
			mode === 'light' ? 'hsla(205, 70%, 52%, 24%)' : 'hsla(205, 70%, 58%, 20%)'
		colors.blue.solid = mode === 'light' ? accent : accentDark
		colors.violet.solid = mode === 'light' ? '#6a8fd4' : '#7b9ee0'
	}
})

const SUNRISE_THEME = cloneTheme('sunrise', (theme) => {
	const accent = '#c77dba'
	const accentDark = '#e090c8'
	for (const mode of ['light', 'dark'] as const) {
		const colors = theme.colors[mode]
		colors.background = mode === 'light' ? '#fff0f6' : '#2a1528'
		colors.negativeSpace = colors.background
		colors.selectionStroke = accent
		colors.selectionFill =
			mode === 'light' ? 'hsla(310, 45%, 55%, 22%)' : 'hsla(310, 45%, 62%, 18%)'
		colors.blue.solid = mode === 'light' ? '#e8a0c8' : accentDark
		colors.violet.solid = mode === 'light' ? '#b888d8' : '#c898e8'
		colors.red.solid = mode === 'light' ? '#f0a8b8' : '#e87898'
	}
})

const SUNSET_THEME = cloneTheme('sunset', (theme) => {
	const accent = '#e85d4a'
	const accentDark = '#f07858'
	for (const mode of ['light', 'dark'] as const) {
		const colors = theme.colors[mode]
		colors.background = mode === 'light' ? '#fff4ec' : '#24140f'
		colors.negativeSpace = colors.background
		colors.selectionStroke = accent
		colors.selectionFill = mode === 'light' ? 'hsla(14, 78%, 55%, 24%)' : 'hsla(14, 78%, 58%, 20%)'
		colors.blue.solid = mode === 'light' ? '#f0884a' : accentDark
		colors.red.solid = accent
	}
})

export const CANVAS_THEME_DEFINITIONS: Record<CanvasThemeMode, CanvasThemeModeDefinition> = {
	light: {
		id: 'light',
		name: 'Light mode',
		swatchBackground: 'hsl(210, 20%, 98%)',
		themeId: 'default',
		colorScheme: 'light',
		cssOverridesLight: {},
		cssOverridesDark: {},
	},
	dark: {
		id: 'dark',
		name: 'Dark mode',
		swatchBackground: 'hsl(240, 5%, 6.5%)',
		themeId: 'default',
		colorScheme: 'dark',
		cssOverridesLight: {},
		cssOverridesDark: {},
	},
	sky: {
		id: 'sky',
		name: 'Sky mode',
		swatchBackground: 'linear-gradient(160deg, #b8dcff 0%, #7eb8e8 100%)',
		themeId: 'sky',
		cssOverridesLight: {
			'tl-color-background': '#e8f4fc',
			'tl-color-primary': '#3b8fd9',
			'tl-color-selected': '#3b8fd9',
			'tl-color-focus': '#2f7fc8',
			'tl-color-selection-stroke': '#3b8fd9',
			'tl-color-selection-fill': 'hsla(205, 70%, 52%, 24%)',
		},
		cssOverridesDark: {
			'tl-color-background': '#0f1a24',
			'tl-color-primary': '#5aa8e8',
			'tl-color-selected': '#5aa8e8',
			'tl-color-focus': '#7ebef0',
			'tl-color-selection-stroke': '#5aa8e8',
			'tl-color-selection-fill': 'hsla(205, 70%, 58%, 20%)',
		},
	},
	sunrise: {
		id: 'sunrise',
		name: 'Sunrise mode',
		swatchBackground: 'linear-gradient(135deg, #ffd6e8 0%, #e8c4ff 55%, #c9b8ff 100%)',
		themeId: 'sunrise',
		canvasGradientLight: 'linear-gradient(160deg, #ffe8f2 0%, #f5d4ff 45%, #e4d0ff 100%)',
		canvasGradientDark: 'linear-gradient(160deg, #2a1528 0%, #3a2040 45%, #352858 100%)',
		cssOverridesLight: {
			'tl-color-background': '#fff0f6',
			'tl-color-primary': '#c77dba',
			'tl-color-selected': '#c77dba',
			'tl-color-focus': '#b068a8',
			'tl-color-selection-stroke': '#c77dba',
			'tl-color-selection-fill': 'hsla(310, 45%, 55%, 22%)',
		},
		cssOverridesDark: {
			'tl-color-background': '#2a1528',
			'tl-color-primary': '#e090c8',
			'tl-color-selected': '#e090c8',
			'tl-color-focus': '#f0a8d8',
			'tl-color-selection-stroke': '#e090c8',
			'tl-color-selection-fill': 'hsla(310, 45%, 62%, 18%)',
		},
	},
	sunset: {
		id: 'sunset',
		name: 'Sunset mode',
		swatchBackground: 'linear-gradient(135deg, #ffb07a 0%, #ff7a52 50%, #e85d4a 100%)',
		themeId: 'sunset',
		canvasGradientLight:
			'linear-gradient(165deg, #ffe2c8 0%, #ffb088 40%, #f07050 75%, #e04838 100%)',
		canvasGradientDark:
			'linear-gradient(165deg, #24140f 0%, #4a2018 40%, #6a2818 75%, #8a3018 100%)',
		cssOverridesLight: {
			'tl-color-background': '#fff4ec',
			'tl-color-primary': '#e85d4a',
			'tl-color-selected': '#e85d4a',
			'tl-color-focus': '#d04a38',
			'tl-color-selection-stroke': '#e85d4a',
			'tl-color-selection-fill': 'hsla(14, 78%, 55%, 24%)',
		},
		cssOverridesDark: {
			'tl-color-background': '#24140f',
			'tl-color-primary': '#f07858',
			'tl-color-selected': '#f07858',
			'tl-color-focus': '#f89878',
			'tl-color-selection-stroke': '#f07858',
			'tl-color-selection-fill': 'hsla(14, 78%, 58%, 20%)',
		},
	},
}

export function getCssOverridesForMode(
	definition: CanvasThemeModeDefinition,
	colorMode: 'light' | 'dark'
): Record<string, string> {
	return colorMode === 'dark' ? definition.cssOverridesDark : definition.cssOverridesLight
}

export function getCanvasGradientForMode(
	definition: CanvasThemeModeDefinition,
	colorMode: 'light' | 'dark'
): string | undefined {
	return colorMode === 'dark' ? definition.canvasGradientDark : definition.canvasGradientLight
}

const ALL_OVERRIDE_KEYS = [
	...new Set(
		CANVAS_THEME_MODE_ORDER.flatMap((id) => {
			const d = CANVAS_THEME_DEFINITIONS[id]
			return [...Object.keys(d.cssOverridesLight), ...Object.keys(d.cssOverridesDark)]
		})
	),
]

export function getAllCanvasThemeOverrideKeys(): string[] {
	return ALL_OVERRIDE_KEYS
}

export const CANVAS_THEMES: Partial<TLThemes> = {
	sky: SKY_THEME,
	sunrise: SUNRISE_THEME,
	sunset: SUNSET_THEME,
}

export function isCanvasThemeMode(value: string | null): value is CanvasThemeMode {
	return value !== null && value in CANVAS_THEME_DEFINITIONS
}

export function readStoredCanvasThemeMode(): CanvasThemeMode {
	try {
		const stored = localStorage.getItem(CANVAS_THEME_MODE_STORAGE_KEY)
		if (isCanvasThemeMode(stored)) return stored
	} catch {
		// ignore
	}
	return 'light'
}

export function writeStoredCanvasThemeMode(mode: CanvasThemeMode) {
	try {
		localStorage.setItem(CANVAS_THEME_MODE_STORAGE_KEY, mode)
	} catch {
		// ignore
	}
}
