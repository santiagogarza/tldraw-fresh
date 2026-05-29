/** @public */
export type CanvasThemeId = 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset'

/** @public */
export interface CanvasThemeDefinition {
	id: CanvasThemeId
	labelKey: string
	swatch: string
	baseColorMode: 'light' | 'dark'
	cssVariables: Record<string, string>
	backgroundImage?: string
}

/** @public */
export const DEFAULT_CANVAS_THEME_ID: CanvasThemeId = 'light'

const CSS_VAR_KEYS = [
	'tl-color-background',
	'tl-color-background-image',
	'tl-color-selected',
	'tl-color-selected-contrast',
	'tl-color-primary',
	'tl-color-focus',
	'tl-color-panel',
	'tl-color-panel-contrast',
	'tl-color-low',
	'tl-color-low-border',
	'tl-color-divider',
	'tl-color-selection-fill',
	'tl-color-selection-stroke',
] as const

/** @internal */
export const CANVAS_THEME_CSS_VAR_KEYS: readonly string[] = CSS_VAR_KEYS

/** @public */
export const CANVAS_THEME_DEFINITIONS: CanvasThemeDefinition[] = [
	{
		id: 'light',
		labelKey: 'canvas-theme.light',
		swatch: 'hsl(210, 20%, 98%)',
		baseColorMode: 'light',
		cssVariables: {},
	},
	{
		id: 'dark',
		labelKey: 'canvas-theme.dark',
		swatch: 'hsl(240, 5%, 6.5%)',
		baseColorMode: 'dark',
		cssVariables: {},
	},
	{
		id: 'sky',
		labelKey: 'canvas-theme.sky',
		swatch: 'hsl(200, 80%, 88%)',
		baseColorMode: 'light',
		cssVariables: {
			'tl-color-background': 'hsl(200, 80%, 92%)',
			'tl-color-selected': 'hsl(200, 70%, 45%)',
			'tl-color-selected-contrast': 'hsl(0, 0%, 100%)',
			'tl-color-primary': 'hsl(200, 70%, 45%)',
			'tl-color-focus': 'hsl(200, 70%, 40%)',
			'tl-color-panel': 'hsl(200, 50%, 96%)',
			'tl-color-panel-contrast': 'hsl(200, 60%, 98%)',
			'tl-color-low': 'hsl(200, 40%, 90%)',
			'tl-color-low-border': 'hsl(200, 35%, 85%)',
			'tl-color-divider': 'hsl(200, 30%, 82%)',
			'tl-color-selection-fill': 'hsla(200, 70%, 45%, 24%)',
			'tl-color-selection-stroke': 'hsl(200, 70%, 45%)',
		},
	},
	{
		id: 'sunrise',
		labelKey: 'canvas-theme.sunrise',
		swatch: 'linear-gradient(135deg, hsl(330, 70%, 85%) 0%, hsl(270, 50%, 85%) 100%)',
		baseColorMode: 'light',
		backgroundImage: 'linear-gradient(135deg, hsl(330, 70%, 88%) 0%, hsl(270, 50%, 88%) 100%)',
		cssVariables: {
			'tl-color-background': 'hsl(300, 45%, 88%)',
			'tl-color-selected': 'hsl(330, 65%, 55%)',
			'tl-color-selected-contrast': 'hsl(0, 0%, 100%)',
			'tl-color-primary': 'hsl(330, 65%, 55%)',
			'tl-color-focus': 'hsl(270, 50%, 50%)',
			'tl-color-panel': 'hsla(330, 60%, 95%, 0.92)',
			'tl-color-panel-contrast': 'hsl(330, 50%, 98%)',
			'tl-color-low': 'hsla(330, 50%, 90%, 0.85)',
			'tl-color-low-border': 'hsla(330, 40%, 85%, 0.9)',
			'tl-color-divider': 'hsla(300, 30%, 80%, 0.9)',
			'tl-color-selection-fill': 'hsla(330, 65%, 55%, 24%)',
			'tl-color-selection-stroke': 'hsl(330, 65%, 55%)',
		},
	},
	{
		id: 'sunset',
		labelKey: 'canvas-theme.sunset',
		swatch: 'linear-gradient(135deg, hsl(25, 90%, 70%) 0%, hsl(0, 70%, 55%) 100%)',
		baseColorMode: 'light',
		backgroundImage: 'linear-gradient(135deg, hsl(25, 90%, 72%) 0%, hsl(0, 70%, 58%) 100%)',
		cssVariables: {
			'tl-color-background': 'hsl(15, 75%, 65%)',
			'tl-color-selected': 'hsl(15, 85%, 50%)',
			'tl-color-selected-contrast': 'hsl(0, 0%, 100%)',
			'tl-color-primary': 'hsl(15, 85%, 50%)',
			'tl-color-focus': 'hsl(0, 70%, 45%)',
			'tl-color-panel': 'hsla(20, 80%, 95%, 0.92)',
			'tl-color-panel-contrast': 'hsl(25, 70%, 98%)',
			'tl-color-low': 'hsla(20, 70%, 90%, 0.85)',
			'tl-color-low-border': 'hsla(15, 60%, 85%, 0.9)',
			'tl-color-divider': 'hsla(15, 50%, 80%, 0.9)',
			'tl-color-selection-fill': 'hsla(15, 85%, 50%, 24%)',
			'tl-color-selection-stroke': 'hsl(15, 85%, 50%)',
		},
	},
]

/** @public */
export function isCanvasThemeId(value: string): value is CanvasThemeId {
	return CANVAS_THEME_DEFINITIONS.some((def) => def.id === value)
}

/** @public */
export function getCanvasThemeDefinition(id: CanvasThemeId): CanvasThemeDefinition {
	return CANVAS_THEME_DEFINITIONS.find((def) => def.id === id) ?? CANVAS_THEME_DEFINITIONS[0]
}
