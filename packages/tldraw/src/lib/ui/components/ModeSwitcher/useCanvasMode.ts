import { useEditor } from '@tldraw/editor'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { applyCanvasModeStyles } from './applyCanvasModeStyles'
import {
	DEFAULT_CANVAS_MODE_ID,
	getCanvasModeById,
	type TLCanvasModeId,
} from './modes'

export const CANVAS_MODE_STORAGE_KEY = 'tldraw_canvas_mode'

/** @public */
export function useCanvasMode() {
	const editor = useEditor()
	const [storedCanvasModeId, setStoredCanvasModeId] = useLocalStorageState<TLCanvasModeId>(
		CANVAS_MODE_STORAGE_KEY,
		DEFAULT_CANVAS_MODE_ID
	)

	const canvasMode = getCanvasModeById(storedCanvasModeId)

	useLayoutEffect(() => {
		if (storedCanvasModeId !== canvasMode.id) {
			setStoredCanvasModeId(canvasMode.id)
		}
	}, [canvasMode.id, setStoredCanvasModeId, storedCanvasModeId])

	useLayoutEffect(() => {
		const cleanup = applyCanvasModeStyles(editor.getContainer(), canvasMode)
		editor.user.updateUserPreferences({ colorScheme: canvasMode.colorScheme })
		return cleanup
	}, [canvasMode, editor])

	const setCanvasMode = useCallback(
		(id: TLCanvasModeId) => {
			setStoredCanvasModeId(getCanvasModeById(id).id)
		},
		[setStoredCanvasModeId]
	)

	return useMemo(
		() => ({
			canvasMode,
			canvasModeId: canvasMode.id,
			getCanvasMode: () => canvasMode,
			setCanvasMode,
		}),
		[canvasMode, setCanvasMode]
	)
}
