import { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'

/** @public */
export type TLCanvasModeId = 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset'

/** @public */
export interface TLCanvasMode {
	id: TLCanvasModeId
	label: TLUiTranslationKey
	colorScheme: 'light' | 'dark'
	background: string
	accent: string
	swatch: string
}

/** @public */
export const CANVAS_MODES: readonly TLCanvasMode[] = [
	{
		id: 'light',
		label: 'mode.light.label',
		colorScheme: 'light',
		background: '#ffffff',
		accent: '#3183ed',
		swatch: '#ffffff',
	},
	{
		id: 'dark',
		label: 'mode.dark.label',
		colorScheme: 'dark',
		background: '#0e0e10',
		accent: '#3183ed',
		swatch: '#0e0e10',
	},
	{
		id: 'sky',
		label: 'mode.sky.label',
		colorScheme: 'light',
		background: '#cfe8ff',
		accent: '#3f8efc',
		swatch: '#cfe8ff',
	},
	{
		id: 'sunrise',
		label: 'mode.sunrise.label',
		colorScheme: 'light',
		background: 'linear-gradient(135deg, #ffd6e7 0%, #e0c8ff 100%)',
		accent: '#d45aa3',
		swatch: 'linear-gradient(135deg, #ffd6e7 0%, #e0c8ff 100%)',
	},
	{
		id: 'sunset',
		label: 'mode.sunset.label',
		colorScheme: 'light',
		background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
		accent: '#ff5c33',
		swatch: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
	},
]

export const DEFAULT_CANVAS_MODE_ID: TLCanvasModeId = 'light'

const CANVAS_MODE_IDS = new Set(CANVAS_MODES.map((mode) => mode.id))

/** @public */
export function isCanvasModeId(value: unknown): value is TLCanvasModeId {
	return typeof value === 'string' && CANVAS_MODE_IDS.has(value as TLCanvasModeId)
}

/** @public */
export function getCanvasModeById(id: TLCanvasModeId): TLCanvasMode {
	return CANVAS_MODES.find((mode) => mode.id === id) ?? CANVAS_MODES[0]
}
