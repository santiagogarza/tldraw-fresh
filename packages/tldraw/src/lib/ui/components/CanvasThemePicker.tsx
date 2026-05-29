import { useValue } from '@tldraw/editor'
import { memo } from 'react'
import {
	CANVAS_THEME_DEFINITIONS,
	CanvasThemeId,
	getCanvasThemeDefinition,
} from '../canvas-theme/canvasThemeDefinitions'
import { getCanvasThemeAtom, setCanvasTheme } from '../canvas-theme/canvasThemeState'
import { useUiEvents } from '../context/events'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from './primitives/Button/TldrawUiButton'
import { TldrawUiButtonLabel } from './primitives/Button/TldrawUiButtonLabel'
import {
	TldrawUiDropdownMenuCheckboxItem,
	TldrawUiDropdownMenuContent,
	TldrawUiDropdownMenuRoot,
	TldrawUiDropdownMenuTrigger,
} from './primitives/TldrawUiDropdownMenu'

/** @public @react */
export const CanvasThemePicker = memo(function CanvasThemePicker() {
	const msg = useTranslation()
	const trackEvent = useUiEvents()
	const canvasThemeAtom = getCanvasThemeAtom()
	const themeId = useValue('canvasTheme', () => canvasThemeAtom.get(), [canvasThemeAtom])
	const activeTheme = getCanvasThemeDefinition(themeId)

	const handleSelect = (id: CanvasThemeId) => {
		setCanvasTheme(id)
		trackEvent('set-canvas-theme', { source: 'menu', value: id })
	}

	return (
		<TldrawUiDropdownMenuRoot id="canvas-theme-picker">
			<TldrawUiDropdownMenuTrigger>
				<TldrawUiButton
					type="icon"
					className="tlui-canvas-theme-picker__trigger"
					data-testid="canvas-theme-picker.trigger"
					title={msg('canvas-theme.label')}
				>
					<span
						className="tlui-canvas-theme-picker__swatch"
						style={{ background: activeTheme.swatch }}
					/>
				</TldrawUiButton>
			</TldrawUiDropdownMenuTrigger>
			<TldrawUiDropdownMenuContent side="bottom" align="start" sideOffset={6}>
				{CANVAS_THEME_DEFINITIONS.map((theme) => (
					<TldrawUiDropdownMenuCheckboxItem
						key={theme.id}
						checked={themeId === theme.id}
						title={msg(theme.labelKey)}
						onSelect={() => handleSelect(theme.id)}
					>
						<span
							className="tlui-canvas-theme-picker__option-swatch"
							style={{ background: theme.swatch }}
						/>
						<TldrawUiButtonLabel>{msg(theme.labelKey)}</TldrawUiButtonLabel>
					</TldrawUiDropdownMenuCheckboxItem>
				))}
			</TldrawUiDropdownMenuContent>
		</TldrawUiDropdownMenuRoot>
	)
})
