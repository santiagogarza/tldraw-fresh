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
		accent: 'hsl(214, 84%, 56%)',
		swatch: '#ffffff',
	},
	{
		id: 'dark',
		label: 'mode.dark.label',
		colorScheme: 'dark',
		background: '#0e0e10',
		accent: 'hsl(217, 89%, 61%)',
		swatch: '#0e0e10',
	},
	{
		id: 'sky',
		label: 'mode.sky.label',
		colorScheme: 'light',
		background: '#cfe8ff',
		accent: 'hsl(210, 72%, 48%)',
		swatch: '#cfe8ff',
	},
	{
		id: 'sunrise',
		label: 'mode.sunrise.label',
		colorScheme: 'light',
		background: 'linear-gradient(135deg, #ffd6e7 0%, #e0c8ff 100%)',
		accent: 'hsl(310, 58%, 52%)',
		swatch: 'linear-gradient(135deg, #ffd6e7 0%, #e0c8ff 100%)',
	},
	{
		id: 'sunset',
		label: 'mode.sunset.label',
		colorScheme: 'light',
		background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
		accent: 'hsl(12, 90%, 52%)',
		swatch: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
	},
]

const DEFAULT_CANVAS_MODE_ID: TLCanvasModeId = 'light'

const CANVAS_MODE_STORAGE_KEY = 'tldraw_canvas_mode'

/** @public */
export function isCanvasModeId(value: unknown): value is TLCanvasModeId {
	return typeof value === 'string' && CANVAS_MODES.some((mode) => mode.id === value)
}

/** @public */
export function getCanvasModeById(id: TLCanvasModeId): TLCanvasMode {
	const mode = CANVAS_MODES.find((m) => m.id === id)
	if (!mode) {
		throw new Error(`Unknown canvas mode: ${id}`)
	}
	return mode
}
