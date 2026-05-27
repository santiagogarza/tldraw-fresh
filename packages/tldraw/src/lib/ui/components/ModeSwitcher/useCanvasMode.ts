import { useCallback } from 'react'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import {
	CANVAS_MODES,
	DEFAULT_CANVAS_MODE_ID,
	TLCanvasMode,
	TLCanvasModeId,
	getCanvasMode,
	isCanvasModeId,
} from './modes'

/** @public */
export const CANVAS_MODE_STORAGE_KEY = 'tldraw_canvas_mode'

/**
 * Read and write the active canvas mode for the page.
 *
 * The mode is persisted to localStorage under {@link CANVAS_MODE_STORAGE_KEY}.
 * Returns a tuple of `[mode, setCanvasMode]`, where `mode` is the resolved
 * {@link TLCanvasMode} descriptor and `setCanvasMode` accepts a
 * {@link TLCanvasModeId}.
 *
 * @public
 */
export function useCanvasMode(): readonly [TLCanvasMode, (id: TLCanvasModeId) => void] {
	const [storedId, setStoredId] = useLocalStorageState<TLCanvasModeId>(
		CANVAS_MODE_STORAGE_KEY,
		DEFAULT_CANVAS_MODE_ID
	)

	const safeId: TLCanvasModeId = isCanvasModeId(storedId) ? storedId : DEFAULT_CANVAS_MODE_ID
	const mode = getCanvasMode(safeId)

	const setCanvasMode = useCallback(
		(id: TLCanvasModeId) => {
			if (!CANVAS_MODES.some((m) => m.id === id)) return
			setStoredId(id)
		},
		[setStoredId]
	)

	return [mode, setCanvasMode] as const
}
