import type { CSSProperties } from 'react'
import {
	TldrawUiButton,
	TldrawUiButtonLabel,
	TldrawUiDropdownMenuContent,
	TldrawUiDropdownMenuItem,
	TldrawUiDropdownMenuRoot,
	TldrawUiDropdownMenuTrigger,
} from 'tldraw'
import {
	CANVAS_THEME_LABELS,
	CANVAS_THEME_MODES,
	CANVAS_THEME_SWATCHES,
	type CanvasThemeMode,
} from './canvasThemeConstants'
import { useCanvasTheme } from './useCanvasTheme'

function getSwatchStyle(mode: CanvasThemeMode): CSSProperties {
	const swatch = CANVAS_THEME_SWATCHES[mode]
	if (swatch.startsWith('linear-gradient')) {
		return { backgroundImage: swatch }
	}
	return { backgroundColor: swatch }
}

export function CanvasThemePicker() {
	const { mode, setMode } = useCanvasTheme()

	return (
		<TldrawUiDropdownMenuRoot id="canvas-theme-picker">
			<TldrawUiDropdownMenuTrigger>
				<button
					type="button"
					className="canvas-theme-picker__trigger"
					aria-label="Canvas theme"
					title="Canvas theme"
				>
					<span
						className="canvas-theme-picker__dot"
						data-mode={mode}
						style={getSwatchStyle(mode)}
						aria-hidden
					/>
				</button>
			</TldrawUiDropdownMenuTrigger>
			<TldrawUiDropdownMenuContent
				className="canvas-theme-picker__menu"
				side="bottom"
				align="start"
				sideOffset={6}
			>
				{CANVAS_THEME_MODES.map((themeMode) => (
					<TldrawUiDropdownMenuItem key={themeMode}>
						<TldrawUiButton
							type="menu"
							className="canvas-theme-picker__item"
							isActive={mode === themeMode}
							onClick={() => setMode(themeMode)}
						>
							<span
								className="canvas-theme-picker__swatch"
								data-mode={themeMode}
								style={getSwatchStyle(themeMode)}
								aria-hidden
							/>
							<TldrawUiButtonLabel>{CANVAS_THEME_LABELS[themeMode]}</TldrawUiButtonLabel>
						</TldrawUiButton>
					</TldrawUiDropdownMenuItem>
				))}
			</TldrawUiDropdownMenuContent>
		</TldrawUiDropdownMenuRoot>
	)
}
