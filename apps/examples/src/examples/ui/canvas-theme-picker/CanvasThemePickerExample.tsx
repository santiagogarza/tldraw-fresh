import { TLComponents, Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { CanvasThemeBackground } from './CanvasThemeBackground'
import { CanvasThemeMenuPanel } from './CanvasThemeMenuPanel'
import './canvas-theme.css'

const components: TLComponents = {
	MenuPanel: CanvasThemeMenuPanel,
	Background: CanvasThemeBackground,
}

export default function CanvasThemePickerExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw persistenceKey="canvas-theme-picker-example" components={components} />
		</div>
	)
}

/*
This example adds a canvas theme picker to the top-left menu bar. Use the circle
next to the main menu to switch between five canvas modes: light, dark, sky,
sunrise, and sunset. The selection updates the canvas background and accent
colors, and persists across reloads via localStorage.
*/
