import { useEditor, useValue } from '@tldraw/editor'
import classNames from 'classnames'
import { memo, useCallback, useEffect } from 'react'
import { useUiEvents } from '../../context/events'
import { useMenuIsOpen } from '../../hooks/useMenuIsOpen'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiIcon } from '../primitives/TldrawUiIcon'
import {
	TldrawUiPopover,
	TldrawUiPopoverContent,
	TldrawUiPopoverTrigger,
} from '../primitives/TldrawUiPopover'
import { applyCanvasModeStyles } from './applyCanvasModeStyles'
import { CANVAS_MODES, TLCanvasMode, TLCanvasModeId } from './modes'
import { useCanvasMode } from './useCanvasMode'

/** @public @react */
export const DefaultModeSwitcher = memo(function DefaultModeSwitcher() {
	const editor = useEditor()
	const msg = useTranslation()
	const trackEvent = useUiEvents()
	const [mode, setCanvasMode] = useCanvasMode()
	const [isOpen, onOpenChange] = useMenuIsOpen('mode-switcher')

	const currentColorScheme = useValue(
		'mode-switcher color-scheme',
		() => editor.user.getUserPreferences().colorScheme,
		[editor]
	)

	useEffect(() => {
		applyCanvasModeStyles(editor.getContainer(), mode)
	}, [editor, mode])

	useEffect(() => {
		if (currentColorScheme === mode.colorScheme) return
		editor.user.updateUserPreferences({ colorScheme: mode.colorScheme })
	}, [editor, mode, currentColorScheme])

	const handleSelect = useCallback(
		(id: TLCanvasModeId) => {
			setCanvasMode(id)
			trackEvent('canvas-mode', { source: 'menu', value: id })
			onOpenChange(false)
		},
		[setCanvasMode, trackEvent, onOpenChange]
	)

	const triggerLabel = msg(mode.label)
	const menuTitle = msg('mode.menu.title')

	return (
		<TldrawUiPopover id="mode-switcher" open={isOpen} onOpenChange={onOpenChange}>
			<TldrawUiPopoverTrigger>
				<TldrawUiButton
					type="icon"
					className="tlui-mode-switcher__trigger"
					data-testid="mode-switcher.button"
					title={triggerLabel}
					aria-label={menuTitle}
					tooltip={triggerLabel}
				>
					<span
						className="tlui-mode-switcher__swatch"
						aria-hidden="true"
						style={{ background: mode.swatch }}
					/>
				</TldrawUiButton>
			</TldrawUiPopoverTrigger>
			<TldrawUiPopoverContent side="bottom" align="start" sideOffset={6} alignOffset={0}>
				<div
					className="tlui-mode-switcher__menu"
					role="menu"
					aria-label={menuTitle}
					data-testid="mode-switcher.menu"
				>
					{CANVAS_MODES.map((item) => (
						<ModeSwitcherMenuItem
							key={item.id}
							mode={item}
							isActive={item.id === mode.id}
							label={msg(item.label)}
							onSelect={handleSelect}
						/>
					))}
				</div>
			</TldrawUiPopoverContent>
		</TldrawUiPopover>
	)
})

interface ModeSwitcherMenuItemProps {
	mode: TLCanvasMode
	isActive: boolean
	label: string
	onSelect(id: TLCanvasModeId): void
}

function ModeSwitcherMenuItem({ mode, isActive, label, onSelect }: ModeSwitcherMenuItemProps) {
	const msg = useTranslation()
	return (
		<button
			type="button"
			role="menuitemradio"
			aria-checked={isActive}
			data-testid={`mode-switcher.item.${mode.id}`}
			data-isactive={isActive}
			className={classNames('tlui-button', 'tlui-button__menu', 'tlui-mode-switcher__item')}
			onClick={() => onSelect(mode.id)}
		>
			<span
				className="tlui-mode-switcher__item-swatch"
				aria-hidden="true"
				style={{ background: mode.swatch }}
			/>
			<span className="tlui-mode-switcher__item-label">{label}</span>
			<span className="tlui-mode-switcher__item-check" aria-hidden={!isActive}>
				{isActive ? <TldrawUiIcon label={msg('ui.checked')} icon="check" small /> : null}
			</span>
		</button>
	)
}
