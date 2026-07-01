import { useEditor } from '@tldraw/editor'
import { useEffect } from 'react'
import { CANVAS_THEME_GRADIENTS } from './canvasThemeConstants'
import { applyCanvasThemeToContainer, useCanvasThemeMode } from './useCanvasTheme'

export function CanvasThemeBackground() {
	const editor = useEditor()
	const mode = useCanvasThemeMode()
	const gradient = CANVAS_THEME_GRADIENTS[mode]

	useEffect(() => {
		applyCanvasThemeToContainer(editor.getContainer(), mode)
	}, [editor, mode])

	if (gradient) {
		return (
			<div
				className="tl-background"
				style={{
					backgroundImage: gradient,
					backgroundColor: 'transparent',
				}}
			/>
		)
	}

	return <div className="tl-background" />
}
