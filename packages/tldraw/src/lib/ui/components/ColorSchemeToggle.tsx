import { useEditor, useValue } from '@tldraw/editor'
import { memo, useCallback } from 'react'
import { useActions } from '../context/actions'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from './primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from './primitives/Button/TldrawUiButtonIcon'

/** A top-bar control that switches between light and dark color scheme (no "system" option on click). @public @react */
export const ColorSchemeToggle = memo(function ColorSchemeToggle({
	className,
}: {
	className?: string
}) {
	const editor = useEditor()
	const { 'toggle-dark-mode': toggleDarkMode } = useActions()
	const msg = useTranslation()
	const isDarkMode = useValue('isDarkMode', () => editor.user.getIsDarkMode(), [editor])

	const onClick = useCallback(() => {
		toggleDarkMode.onSelect('color-scheme-button')
	}, [toggleDarkMode])

	const label = msg('action.toggle-dark-mode')

	return (
		<TldrawUiButton
			type="icon"
			className={className}
			title={label}
			tooltip={label}
			aria-pressed={isDarkMode}
			aria-label={label}
			onClick={onClick}
			data-testid="color-scheme.toggle"
		>
			<TldrawUiButtonIcon icon="arrow-cycle" small />
		</TldrawUiButton>
	)
})
