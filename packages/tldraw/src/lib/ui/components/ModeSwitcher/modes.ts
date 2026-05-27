import { type TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'

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

export const DEFAULT_CANVAS_MODE_ID: TLCanvasModeId = 'light'

/** @public */
export const CANVAS_MODES = [
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
		accent: 'hsl(214, 84%, 56%)',
		swatch: '#0e0e10',
	},
	{
		id: 'sky',
		label: 'mode.sky.label',
		colorScheme: 'light',
		background: '#cfe8ff',
		accent: '#1f8adf',
		swatch: '#cfe8ff',
	},
	{
		id: 'sunrise',
		label: 'mode.sunrise.label',
		colorScheme: 'light',
		background: 'linear-gradient(135deg, #ffd6e7 0%, #e0c8ff 100%)',
		accent: '#b653d9',
		swatch: 'linear-gradient(135deg, #ffd6e7 0%, #e0c8ff 100%)',
	},
	{
		id: 'sunset',
		label: 'mode.sunset.label',
		colorScheme: 'light',
		background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
		accent: '#f25a2a',
		swatch: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
	},
] satisfies readonly TLCanvasMode[]

export function getCanvasModeById(id: unknown): TLCanvasMode {
	return CANVAS_MODES.find((mode) => mode.id === id) ?? CANVAS_MODES[0]
}
