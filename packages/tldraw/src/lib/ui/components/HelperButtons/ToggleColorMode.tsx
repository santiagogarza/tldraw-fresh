import { useEditor, useValue } from '@tldraw/editor'
import { useActions } from '../../context/actions'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'

const SunIcon = (
	<div
		className="tlui-icon"
		style={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
			<line
				x1="9"
				y1="1"
				x2="9"
				y2="3"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="9"
				y1="15"
				x2="9"
				y2="17"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="1"
				y1="9"
				x2="3"
				y2="9"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="15"
				y1="9"
				x2="17"
				y2="9"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="3.34"
				y1="3.34"
				x2="4.76"
				y2="4.76"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="13.24"
				y1="13.24"
				x2="14.66"
				y2="14.66"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="3.34"
				y1="14.66"
				x2="4.76"
				y2="13.24"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="13.24"
				y1="4.76"
				x2="14.66"
				y2="3.34"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	</div>
)

const MoonIcon = (
	<div
		className="tlui-icon"
		style={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M15.5 10.5C14.7 13.4 12.1 15.5 9 15.5C5.41 15.5 2.5 12.59 2.5 9C2.5 5.9 4.6 3.3 7.5 2.5C6.6 4 6.5 5.8 7.1 7.4C7.8 9.2 9.3 10.5 11.1 11C12.5 11.4 14 11.2 15.5 10.5Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	</div>
)

/** @public @react */
export function ToggleColorMode() {
	const editor = useEditor()
	const actions = useActions()
	const msg = useTranslation()
	const isDarkMode = useValue('isDarkMode', () => editor.user.getIsDarkMode(), [editor])

	return (
		<TldrawUiButton
			type="icon"
			title={msg('action.toggle-dark-mode')}
			onClick={() => actions['toggle-dark-mode'].onSelect('helper-buttons')}
		>
			<TldrawUiButtonIcon icon={isDarkMode ? SunIcon : MoonIcon} />
		</TldrawUiButton>
	)
}
