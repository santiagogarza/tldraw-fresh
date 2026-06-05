import { preventDefault, useContainer } from '@tldraw/editor'
import { Popover as _Popover } from 'radix-ui'
import { useCallback, useState } from 'react'
import { TldrawUiButton } from 'tldraw'
import {
	CANVAS_THEME_DEFINITIONS,
	CANVAS_THEME_MODE_ORDER,
	CanvasThemeMode,
} from './canvas-theme-modes'
import { useCanvasThemeMode } from './useCanvasThemeMode'

/** @public @react */
export function CanvasThemePicker() {
	const container = useContainer()
	const { mode, setMode, definition } = useCanvasThemeMode()
	const [isOpen, setIsOpen] = useState(false)

	const handleOpenChange = useCallback((open: boolean) => {
		setIsOpen(open)
	}, [])

	const handleSelect = useCallback(
		(next: CanvasThemeMode) => {
			setMode(next)
			setIsOpen(false)
		},
		[setMode]
	)

	return (
		<_Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
			<_Popover.Trigger asChild>
				<TldrawUiButton
					type="icon"
					className="canvas-theme-picker__trigger"
					title="Canvas theme"
					aria-label="Canvas theme"
					data-testid="canvas-theme-picker-trigger"
				>
					<span
						className="canvas-theme-picker__swatch"
						style={{ background: definition.swatchBackground }}
						aria-hidden
					/>
				</TldrawUiButton>
			</_Popover.Trigger>
			<_Popover.Portal container={container}>
				<_Popover.Content
					className="canvas-theme-picker__content"
					side="bottom"
					align="start"
					sideOffset={8}
					onTouchEnd={(e) => preventDefault(e)}
				>
					<ul className="canvas-theme-picker__list" role="listbox" aria-label="Canvas themes">
						{CANVAS_THEME_MODE_ORDER.map((id) => {
							const item = CANVAS_THEME_DEFINITIONS[id]
							const isSelected = mode === id
							return (
								<li key={id} role="presentation">
									<button
										type="button"
										role="option"
										aria-selected={isSelected}
										className="canvas-theme-picker__option"
										data-selected={isSelected}
										onClick={() => handleSelect(id)}
									>
										<span
											className="canvas-theme-picker__option-swatch"
											style={{ background: item.swatchBackground }}
											aria-hidden
										/>
										<span className="canvas-theme-picker__option-label">{item.name}</span>
									</button>
								</li>
							)
						})}
					</ul>
				</_Popover.Content>
			</_Popover.Portal>
		</_Popover.Root>
	)
}
