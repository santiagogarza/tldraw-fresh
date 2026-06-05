import { memo } from 'react'
import { DefaultMenuPanel } from 'tldraw'
import { CanvasThemePicker } from './CanvasThemePicker'

/** @public @react */
export const CanvasThemeMenuPanel = memo(function CanvasThemeMenuPanel() {
	return (
		<div className="canvas-theme-picker__menu-wrapper">
			<CanvasThemePicker />
			<DefaultMenuPanel />
		</div>
	)
})
