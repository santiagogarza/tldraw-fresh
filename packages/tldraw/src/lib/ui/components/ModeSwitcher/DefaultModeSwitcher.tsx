import { useEditor } from '@tldraw/editor'
import { type KeyboardEvent, memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { TldrawUiButtonLabel } from '../primitives/Button/TldrawUiButtonLabel'
import {
	TldrawUiPopover,
	TldrawUiPopoverContent,
	TldrawUiPopoverTrigger,
} from '../primitives/TldrawUiPopover'
import { applyCanvasModeStyles, clearCanvasModeStyles } from './applyCanvasModeStyles'
import { CANVAS_MODES, TLCanvasMode } from './modes'
import { useCanvasMode } from './useCanvasMode'

/** @public @react */
export const DefaultModeSwitcher = memo(function DefaultModeSwitcher() {
	const editor = useEditor()
	const msg = useTranslation()
	const { canvasMode, setCanvasMode } = useCanvasMode()
	const rItemButtons = useRef<Array<HTMLButtonElement | null>>([])

	useEffect(() => {
		const container = editor.getContainer()
		applyCanvasModeStyles(container, canvasMode)
		const currentColorScheme = editor.user.getUserPreferences().colorScheme
		if (currentColorScheme !== canvasMode.colorScheme) {
			editor.user.updateUserPreferences({ colorScheme: canvasMode.colorScheme })
		}
	}, [canvasMode, editor])

	useEffect(() => {
		const container = editor.getContainer()
		return () => clearCanvasModeStyles(container)
	}, [editor])

	const currentModeLabel = msg(canvasMode.label)
	const menuTitle = msg('mode.menu.title')

	const selectMode = useCallback(
		(mode: TLCanvasMode) => {
			setCanvasMode(mode.id)
			editor.menus.clearOpenMenus()
		},
		[editor, setCanvasMode]
	)

	const handleMenuKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

			const items = rItemButtons.current.filter(
				(button): button is HTMLButtonElement => button !== null
			)
			if (items.length === 0) return

			event.preventDefault()

			const activeElement = editor.getContainerDocument().activeElement
			const currentIndex = items.findIndex((button) => button === activeElement)
			const startIndex = currentIndex === -1 ? 0 : currentIndex

			let nextIndex = startIndex
			if (event.key === 'ArrowDown') nextIndex = (startIndex + 1) % items.length
			if (event.key === 'ArrowUp') nextIndex = (startIndex - 1 + items.length) % items.length
			if (event.key === 'Home') nextIndex = 0
			if (event.key === 'End') nextIndex = items.length - 1

			items[nextIndex]?.focus()
		},
		[editor]
	)

	const modeItems = useMemo(
		() =>
			CANVAS_MODES.map((mode, index) => {
				const isActive = mode.id === canvasMode.id
				return (
					<TldrawUiButton
						key={mode.id}
						ref={(button) => {
							rItemButtons.current[index] = button
						}}
						type="menu"
						className="tlui-mode-switcher__item"
						data-testid={`mode-switcher.item-${mode.id}`}
						data-isactive={isActive}
						onClick={() => selectMode(mode)}
						role="menuitemradio"
						aria-checked={isActive}
					>
						<span
							className="tlui-mode-switcher__item-swatch"
							style={{ background: mode.swatch }}
							aria-hidden="true"
						/>
						<TldrawUiButtonLabel>{msg(mode.label)}</TldrawUiButtonLabel>
						{isActive ? (
							<TldrawUiButtonIcon icon="check" small />
						) : (
							<span className="tlui-mode-switcher__item-check-spacer" aria-hidden="true" />
						)}
					</TldrawUiButton>
				)
			}),
		[canvasMode.id, msg, selectMode]
	)

	return (
		<TldrawUiPopover id="mode-switcher">
			<TldrawUiPopoverTrigger>
				<TldrawUiButton
					type="icon"
					tooltip={currentModeLabel}
					title={menuTitle}
					aria-label={menuTitle}
					data-testid="mode-switcher.button"
					className="tlui-mode-switcher"
				>
					<span
						className="tlui-mode-switcher__trigger-swatch"
						style={{ background: canvasMode.swatch }}
						aria-hidden="true"
					/>
				</TldrawUiButton>
			</TldrawUiPopoverTrigger>
			<TldrawUiPopoverContent side="bottom" align="start" sideOffset={4}>
				<div
					className="tlui-mode-switcher__menu"
					data-testid="mode-switcher.popover"
					role="menu"
					aria-label={menuTitle}
					onKeyDown={handleMenuKeyDown}
				>
					{modeItems}
				</div>
			</TldrawUiPopoverContent>
		</TldrawUiPopover>
	)
})
