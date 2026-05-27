import { memo, useCallback } from 'react'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonLabel } from '../primitives/Button/TldrawUiButtonLabel'
import {
	TldrawUiDropdownMenuCheckboxItem,
	TldrawUiDropdownMenuContent,
	TldrawUiDropdownMenuGroup,
	TldrawUiDropdownMenuRoot,
	TldrawUiDropdownMenuTrigger,
} from '../primitives/TldrawUiDropdownMenu'
import { CANVAS_MODES, TLCanvasModeId } from './modes'
import { useCanvasMode } from './useCanvasMode'

/** @public @react */
export const DefaultModeSwitcher = memo(function DefaultModeSwitcher() {
	const msg = useTranslation()
	const { canvasMode, canvasModeId, setCanvasMode } = useCanvasMode()

	const menuTitle = msg('mode.menu.title')
	const currentLabel = msg(canvasMode.label)

	const handleSelect = useCallback(
		(id: TLCanvasModeId) => {
			setCanvasMode(id)
		},
		[setCanvasMode]
	)

	return (
		<TldrawUiDropdownMenuRoot id="mode-switcher">
			<TldrawUiDropdownMenuTrigger>
				<TldrawUiButton
					type="icon"
					className="tlui-mode-switcher"
					data-testid="mode-switcher.button"
					aria-label={menuTitle}
					tooltip={currentLabel}
				>
					<span
						className="tlui-mode-switcher__swatch"
						style={{ background: canvasMode.swatch }}
						aria-hidden
					/>
				</TldrawUiButton>
			</TldrawUiDropdownMenuTrigger>
			<TldrawUiDropdownMenuContent side="bottom" align="start" sideOffset={4}>
				<TldrawUiDropdownMenuGroup>
					{CANVAS_MODES.map((mode) => (
						<TldrawUiDropdownMenuCheckboxItem
							key={mode.id}
							data-testid={`mode-switcher.item.${mode.id}`}
							checked={canvasModeId === mode.id}
							title={msg(mode.label)}
							onSelect={() => handleSelect(mode.id)}
						>
							<span
								className="tlui-mode-switcher__item-swatch"
								style={{ background: mode.swatch }}
								aria-hidden
							/>
							<TldrawUiButtonLabel>{msg(mode.label)}</TldrawUiButtonLabel>
						</TldrawUiDropdownMenuCheckboxItem>
					))}
				</TldrawUiDropdownMenuGroup>
			</TldrawUiDropdownMenuContent>
		</TldrawUiDropdownMenuRoot>
	)
})
