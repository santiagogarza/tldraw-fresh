import { useEditor, useValue } from '@tldraw/editor'
import { useCallback, useMemo } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import {
	TldrawUiPopover,
	TldrawUiPopoverContent,
	TldrawUiPopoverTrigger,
} from '../primitives/TldrawUiPopover'
import {
	type CanvasThemeMode,
	getActiveCanvasThemeMode,
	getCanvasThemePreferenceUpdate,
} from './canvasThemePickerUtils'

export type { CanvasThemeMode } from './canvasThemePickerUtils'

const CANVAS_THEME_MODES: {
	mode: CanvasThemeMode
	label: string
	swatch: string
}[] = [
	{ mode: 'light', label: 'theme.light', swatch: '#f9fafb' },
	{ mode: 'dark', label: 'theme.dark', swatch: 'hsl(240, 5%, 6.5%)' },
	{ mode: 'sky', label: 'theme.sky', swatch: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)' },
	{
		mode: 'sunrise',
		label: 'theme.sunrise',
		swatch: 'linear-gradient(135deg, #fce7f3 0%, #e9d5ff 100%)',
	},
	{
		mode: 'sunset',
		label: 'theme.sunset',
		swatch: 'linear-gradient(135deg, #fed7aa 0%, #fca5a5 100%)',
	},
]

/** @public @react */
export function CanvasThemePicker() {
	const editor = useEditor()
	const trackEvent = useUiEvents()
	const msg = useTranslation()

	const activeMode = useValue(
		'active canvas theme mode',
		() => getActiveCanvasThemeMode(editor.getCurrentThemeId(), editor.user.getIsDarkMode()),
		[editor]
	)

	const activeSwatch = useMemo(
		() => CANVAS_THEME_MODES.find((m) => m.mode === activeMode)?.swatch ?? '#f9fafb',
		[activeMode]
	)

	const selectMode = useCallback(
		(mode: CanvasThemeMode) => {
			const { userPreferences, editorThemeId } = getCanvasThemePreferenceUpdate(mode)
			editor.user.updateUserPreferences(userPreferences)
			editor.setCurrentTheme(editorThemeId)
			trackEvent('canvas-theme', { source: 'menu', value: mode })
		},
		[editor, trackEvent]
	)

	return (
		<TldrawUiPopover id="canvas-theme-picker">
			<TldrawUiPopoverTrigger>
				<button
					type="button"
					className="tlui-canvas-theme-picker__trigger"
					aria-label={msg('canvas-theme-picker.title')}
					title={msg('canvas-theme-picker.title')}
				>
					<span
						className="tlui-canvas-theme-picker__swatch"
						style={{ background: activeSwatch }}
						aria-hidden
					/>
				</button>
			</TldrawUiPopoverTrigger>
			<TldrawUiPopoverContent side="bottom" align="start" sideOffset={8}>
				<ul className="tlui-canvas-theme-picker__list" role="listbox">
					{CANVAS_THEME_MODES.map(({ mode, label, swatch }) => (
						<li key={mode} role="presentation">
							<button
								type="button"
								className="tlui-canvas-theme-picker__option"
								role="option"
								aria-selected={activeMode === mode}
								onClick={() => selectMode(mode)}
							>
								<span
									className="tlui-canvas-theme-picker__swatch"
									style={{ background: swatch }}
									aria-hidden
								/>
								<span className="tlui-canvas-theme-picker__label">{msg(label)}</span>
							</button>
						</li>
					))}
				</ul>
			</TldrawUiPopoverContent>
		</TldrawUiPopover>
	)
}
