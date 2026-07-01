export type CanvasThemeMode = 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset'

export const CANVAS_THEME_STORAGE_KEY = 'tldraw-canvas-theme-v1'
export const DEFAULT_CANVAS_THEME_MODE: CanvasThemeMode = 'light'

export const CANVAS_THEME_MODES: CanvasThemeMode[] = ['light', 'dark', 'sky', 'sunrise', 'sunset']

export const CANVAS_THEME_LABELS: Record<CanvasThemeMode, string> = {
	light: 'Light',
	dark: 'Dark',
	sky: 'Sky',
	sunrise: 'Sunrise',
	sunset: 'Sunset',
}

export const CANVAS_THEME_SWATCHES: Record<CanvasThemeMode, string> = {
	light: '#f9fafb',
	dark: '#101011',
	sky: '#85c2e0',
	sunrise: 'linear-gradient(148deg, #ffcdd2 0%, #e1bee7 50%, #ede7f6 100%)',
	sunset: 'linear-gradient(148deg, #ff7043 0%, #ffab40 50%, #ef5350 100%)',
}

export const CANVAS_THEME_GRADIENTS: Partial<Record<CanvasThemeMode, string>> = {
	sunrise: CANVAS_THEME_SWATCHES.sunrise,
	sunset: CANVAS_THEME_SWATCHES.sunset,
}

export function isCanvasThemeMode(value: string | null): value is CanvasThemeMode {
	return CANVAS_THEME_MODES.includes(value as CanvasThemeMode)
}

export function loadCanvasThemeMode(): CanvasThemeMode {
	if (typeof window === 'undefined') return DEFAULT_CANVAS_THEME_MODE
	try {
		const stored = localStorage.getItem(CANVAS_THEME_STORAGE_KEY)
		return isCanvasThemeMode(stored) ? stored : DEFAULT_CANVAS_THEME_MODE
	} catch {
		return DEFAULT_CANVAS_THEME_MODE
	}
}
