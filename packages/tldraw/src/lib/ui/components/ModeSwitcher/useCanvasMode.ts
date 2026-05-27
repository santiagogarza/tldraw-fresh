import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import {
	DEFAULT_CANVAS_MODE_ID,
	TLCanvasMode,
	TLCanvasModeId,
	getCanvasModeById,
	isCanvasModeId,
} from './modes'

const CANVAS_MODE_STORAGE_KEY = 'tldraw-canvas-mode'

/** @public */
export function useCanvasMode() {
	const [storedCanvasModeId, setStoredCanvasModeId] = useLocalStorageState<TLCanvasModeId | string>(
		CANVAS_MODE_STORAGE_KEY,
		DEFAULT_CANVAS_MODE_ID
	)

	const canvasModeId = useMemo<TLCanvasModeId>(
		() => (isCanvasModeId(storedCanvasModeId) ? storedCanvasModeId : DEFAULT_CANVAS_MODE_ID),
		[storedCanvasModeId]
	)

	const canvasMode = useMemo(() => getCanvasModeById(canvasModeId), [canvasModeId])

	const setCanvasMode = useCallback(
		(canvasModeId: TLCanvasModeId) => {
			setStoredCanvasModeId(canvasModeId)
		},
		[setStoredCanvasModeId]
	)

	const getCanvasMode = useCallback((): TLCanvasMode => canvasMode, [canvasMode])

	return {
		canvasModeId,
		canvasMode,
		getCanvasMode,
		setCanvasMode,
	}
}
