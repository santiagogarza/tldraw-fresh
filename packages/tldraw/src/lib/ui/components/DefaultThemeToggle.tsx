import { useEditor, useValue } from '@tldraw/editor'
import { useActions } from '../context/actions'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { kbdStr } from '../kbd-utils'
import { TldrawUiButton } from './primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from './primitives/Button/TldrawUiButtonIcon'

/** @public @react */
export function DefaultThemeToggle() {
	const editor = useEditor()
	const actions = useActions()
	const msg = useTranslation()

	const action = actions['toggle-dark-mode']
	const isDarkMode = useValue('isDarkMode', () => editor.user.getIsDarkMode(), [editor])

	if (!action) return null

	const label = msg('theme.toggle')
	const kbd = action.kbd
	const tooltip = kbd ? `${label} ${kbdStr(kbd)}` : label

	return (
		<TldrawUiButton
			type="icon"
			className="tlui-theme-toggle"
			data-testid="theme-toggle"
			title={label}
			aria-label={label}
			tooltip={tooltip}
			onClick={() => action.onSelect('theme-toggle')}
		>
			<TldrawUiButtonIcon icon={isDarkMode ? 'moon' : 'sun'} />
		</TldrawUiButton>
	)
}
