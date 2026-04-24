import { useEditor, useValue } from '@tldraw/editor'
import { useActions } from '../../context/actions'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'

/** @public @react */
export function ToggleDarkMode() {
	const editor = useEditor()
	const actions = useActions()
	const msg = useTranslation()

	const isDarkMode = useValue('isDarkMode', () => editor.user.getIsDarkMode(), [editor])

	const sunIcon = (
		<div
			className="tlui-icon"
			role="img"
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor">
				<circle cx="9" cy="9" r="3.5" strokeWidth="1.5" />
				<line x1="9" y1="1" x2="9" y2="3" strokeWidth="1.5" strokeLinecap="round" />
				<line x1="9" y1="15" x2="9" y2="17" strokeWidth="1.5" strokeLinecap="round" />
				<line x1="1" y1="9" x2="3" y2="9" strokeWidth="1.5" strokeLinecap="round" />
				<line x1="15" y1="9" x2="17" y2="9" strokeWidth="1.5" strokeLinecap="round" />
				<line x1="3.34" y1="3.34" x2="4.76" y2="4.76" strokeWidth="1.5" strokeLinecap="round" />
				<line x1="13.24" y1="13.24" x2="14.66" y2="14.66" strokeWidth="1.5" strokeLinecap="round" />
				<line x1="3.34" y1="14.66" x2="4.76" y2="13.24" strokeWidth="1.5" strokeLinecap="round" />
				<line x1="13.24" y1="4.76" x2="14.66" y2="3.34" strokeWidth="1.5" strokeLinecap="round" />
			</svg>
		</div>
	)

	const moonIcon = (
		<div
			className="tlui-icon"
			role="img"
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor">
				<path
					d="M15.5 10.5a6.5 6.5 0 0 1-8-8 6.5 6.5 0 1 0 8 8z"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	)

	return (
		<TldrawUiButton
			type="low"
			tooltip={msg('action.toggle-dark-mode')}
			onClick={() => actions['toggle-dark-mode'].onSelect('helper-buttons')}
		>
			<TldrawUiButtonIcon icon={isDarkMode ? sunIcon : moonIcon} />
		</TldrawUiButton>
	)
}
