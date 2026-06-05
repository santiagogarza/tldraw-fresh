import { useEditor, useValue } from 'tldraw'
import {
	CANVAS_THEME_DEFINITIONS,
	CanvasThemeMode,
	getCanvasGradientForMode,
} from './canvas-theme-modes'

/** @public @react */
export function CanvasThemeBackground() {
	const editor = useEditor()
	const colorMode = useValue('colorMode', () => editor.getColorMode(), [editor])
	const { mode, gradient } = useValue(
		'canvasThemeBackground',
		() => {
			const raw = editor.getContainer().dataset.canvasThemeMode
			const resolved = (raw && raw in CANVAS_THEME_DEFINITIONS ? raw : 'light') as CanvasThemeMode
			const definition = CANVAS_THEME_DEFINITIONS[resolved]
			return {
				mode: resolved,
				gradient: getCanvasGradientForMode(definition, colorMode),
			}
		},
		[editor, colorMode]
	)

	if (gradient) {
		return <div className="tl-background" style={{ background: gradient }} data-theme-mode={mode} />
	}

	return <div className="tl-background" data-theme-mode={mode} />
}
