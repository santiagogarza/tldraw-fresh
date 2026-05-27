import { useEditor } from '@tldraw/editor'
import { useCallback, useLayoutEffect } from 'react'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { applyCanvasModeStyles } from './applyCanvasModeStyles'
import {
	CANVAS_MODE_STORAGE_KEY,
	DEFAULT_CANVAS_MODE_ID,
	getCanvasModeById,
	isCanvasModeId,
	TLCanvasMode,
	TLCanvasModeId,
} from './modes'

/** @public */
export function useCanvasMode() {
	const editor = useEditor()
	const [storedModeId, setStoredModeId] = useLocalStorageState<TLCanvasModeId>(
		CANVAS_MODE_STORAGE_KEY,
		DEFAULT_CANVAS_MODE_ID
	)

	const canvasModeId = isCanvasModeId(storedModeId) ? storedModeId : DEFAULT_CANVAS_MODE_ID
	const canvasMode = getCanvasModeById(canvasModeId)

	const applyMode = useCallback(
		(mode: TLCanvasMode) => {
			applyCanvasModeStyles(editor.getContainer(), mode)
			editor.user.updateUserPreferences({ colorScheme: mode.colorScheme })
		},
		[editor]
	)

	useLayoutEffect(() => {
		applyMode(canvasMode)
	}, [applyMode, canvasMode])

	const setCanvasMode = useCallback(
		(id: TLCanvasModeId) => {
			const mode = getCanvasModeById(id)
			setStoredModeId(id)
			applyMode(mode)
		},
		[applyMode, setStoredModeId]
	)

	const getCanvasMode = useCallback(() => getCanvasModeById(canvasModeId), [canvasModeId])

	return {
		canvasMode,
		canvasModeId,
		setCanvasMode,
		getCanvasMode,
	}
}
