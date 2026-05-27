import { type CSSProperties, memo } from 'react'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { TldrawUiButtonLabel } from '../primitives/Button/TldrawUiButtonLabel'
import {
	TldrawUiDropdownMenuContent,
	TldrawUiDropdownMenuItem,
	TldrawUiDropdownMenuRoot,
	TldrawUiDropdownMenuTrigger,
} from '../primitives/TldrawUiDropdownMenu'
import { TldrawUiTooltip } from '../primitives/TldrawUiTooltip'
import { CANVAS_MODES } from './modes'
import { useCanvasMode } from './useCanvasMode'

/** @public @react */
export const DefaultModeSwitcher = memo(function DefaultModeSwitcher() {
	const msg = useTranslation()
	const { canvasMode, setCanvasMode } = useCanvasMode()
	const menuTitle = msg('mode.menu.title')
	const currentLabel = msg(canvasMode.label)

	return (
		<TldrawUiDropdownMenuRoot id="mode-switcher">
			<TldrawUiTooltip content={currentLabel} side="bottom">
				<span className="tlui-mode-switcher__tooltip-target">
					<TldrawUiDropdownMenuTrigger>
						<TldrawUiButton
							type="icon"
							className="tlui-mode-switcher"
							aria-label={menuTitle}
							title={currentLabel}
							data-testid="mode-switcher.button"
							style={
								{
									'--tlui-mode-switcher-swatch': canvasMode.swatch,
								} as CSSProperties
							}
						>
							<span className="tlui-mode-switcher__swatch" />
						</TldrawUiButton>
					</TldrawUiDropdownMenuTrigger>
				</span>
			</TldrawUiTooltip>
			<TldrawUiDropdownMenuContent
				side="bottom"
				align="start"
				alignOffset={0}
				sideOffset={0}
				className="tlui-mode-switcher__menu"
			>
				<div data-testid="mode-switcher.menu" className="tlui-mode-switcher__menu-content">
					{CANVAS_MODES.map((mode) => {
						const label = msg(mode.label)
						const isSelected = mode.id === canvasMode.id
						return (
							<TldrawUiDropdownMenuItem key={mode.id}>
								<TldrawUiButton
									type="menu"
									className="tlui-mode-switcher__item"
									data-testid={`mode-switcher.${mode.id}`}
									aria-checked={isSelected}
									onClick={() => setCanvasMode(mode.id)}
								>
									<span
										className="tlui-mode-switcher__item-swatch"
										style={{ background: mode.swatch }}
									/>
									<TldrawUiButtonLabel>{label}</TldrawUiButtonLabel>
									<span className="tlui-mode-switcher__check">
										{isSelected ? <TldrawUiButtonIcon icon="check" small /> : null}
									</span>
								</TldrawUiButton>
							</TldrawUiDropdownMenuItem>
						)
					})}
				</div>
			</TldrawUiDropdownMenuContent>
		</TldrawUiDropdownMenuRoot>
	)
})
