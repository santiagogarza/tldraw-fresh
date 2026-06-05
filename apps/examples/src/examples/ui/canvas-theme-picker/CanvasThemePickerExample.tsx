import { useMemo } from 'react'
import { Editor, TLTheme, Tldraw, toRichText } from 'tldraw'
import 'tldraw/tldraw.css'
import { CANVAS_THEMES, readStoredCanvasThemeMode } from './canvas-theme-modes'
import { CanvasThemeBackground } from './CanvasThemeBackground'
import { CanvasThemeMenuPanel } from './CanvasThemeMenuPanel'
import { applyCanvasThemeMode } from './useCanvasThemeMode'
import './canvas-theme-picker.css'

declare module '@tldraw/tlschema' {
	interface TLThemes {
		sky: TLTheme
		sunrise: TLTheme
		sunset: TLTheme
	}
}

function createInitialShapes(editor: Editor) {
	if (editor.getCurrentPageShapeIds().size > 0) return
	editor.createShapes([
		{
			type: 'geo',
			x: 80,
			y: 120,
			props: {
				w: 220,
				h: 160,
				color: 'blue',
				richText: toRichText('Canvas theme picker'),
			},
		},
		{
			type: 'note',
			x: 340,
			y: 120,
			props: {
				color: 'violet',
				richText: toRichText('Use the circle in the top-left menu bar to switch modes.'),
			},
		},
	])
}

const components = {
	MenuPanel: CanvasThemeMenuPanel,
	Background: CanvasThemeBackground,
}

export default function CanvasThemePickerExample() {
	const themes = useMemo(() => CANVAS_THEMES, [])

	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="canvas-theme-picker-example"
				themes={themes}
				components={components}
				onMount={(editor) => {
					applyCanvasThemeMode(editor, readStoredCanvasThemeMode())
					createInitialShapes(editor)
				}}
			/>
		</div>
	)
}
