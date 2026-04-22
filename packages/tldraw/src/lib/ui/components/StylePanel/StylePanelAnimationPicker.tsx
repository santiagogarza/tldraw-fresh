import { useEditor, useValue } from '@tldraw/editor'
import { memo, useCallback } from 'react'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TLUiIconType } from '../../icon-types'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { TldrawUiRow } from '../primitives/layout'
import {
	TldrawUiToolbar,
	TldrawUiToolbarToggleGroup,
	TldrawUiToolbarToggleItem,
} from '../primitives/TldrawUiToolbar'
import { useStylePanelContext } from './StylePanelContext'
import { StylePanelSubheading } from './StylePanelSubheading'

type AnimationKind = 'none' | 'jiggle' | 'spin' | 'pulse'

const ANIMATION_ITEMS: ReadonlyArray<{ value: AnimationKind; icon: TLUiIconType }> = [
	{ value: 'none', icon: 'fill-none' },
	{ value: 'jiggle', icon: 'drag-handle-dots' },
	{ value: 'spin', icon: 'rotate-cw' },
	{ value: 'pulse', icon: 'geo-heart' },
]

function getShapeAnimation(meta: unknown): AnimationKind {
	if (meta && typeof meta === 'object' && 'animation' in meta) {
		const value = (meta as { animation?: unknown }).animation
		if (value === 'none' || value === 'jiggle' || value === 'spin' || value === 'pulse') {
			return value
		}
	}
	return 'none'
}

/** @public @react */
export const StylePanelAnimationPicker = memo(function StylePanelAnimationPicker() {
	const editor = useEditor()
	const msg = useTranslation()
	const { enhancedA11yMode } = useStylePanelContext()

	// Read a shared value from the current selection. Returns 'mixed' when
	// shapes disagree, a concrete kind when they all agree, or undefined when
	// nothing is selected.
	const sharedAnimation = useValue<AnimationKind | 'mixed' | undefined>(
		'animation-shared',
		() => {
			const shapes = editor.getSelectedShapes()
			if (shapes.length === 0) return undefined
			let shared: AnimationKind | undefined
			for (const shape of shapes) {
				const kind = getShapeAnimation(shape.meta)
				if (shared === undefined) {
					shared = kind
				} else if (shared !== kind) {
					return 'mixed'
				}
			}
			return shared
		},
		[editor]
	)

	const handleValueChange = useCallback(
		(value: AnimationKind) => {
			const shapes = editor.getSelectedShapes()
			if (shapes.length === 0) return
			editor.markHistoryStoppingPoint('animation picker')
			editor.updateShapes(
				shapes.map((shape) => ({
					id: shape.id,
					type: shape.type,
					meta: { ...shape.meta, animation: value },
				}))
			)
		},
		[editor]
	)

	if (sharedAnimation === undefined) return null

	const title = msg('style-panel.animation')
	const currentValue = sharedAnimation === 'mixed' ? null : sharedAnimation

	return (
		<>
			{enhancedA11yMode && <StylePanelSubheading>{title}</StylePanelSubheading>}
			<TldrawUiToolbar label={title}>
				<TldrawUiToolbarToggleGroup
					data-testid="style.animation"
					type="single"
					value={currentValue}
					asChild
				>
					<TldrawUiRow>
						{ANIMATION_ITEMS.map((item) => {
							const isActive = currentValue === item.value
							const label = title + ' — ' + msg(`animation-style.${item.value}`)
							return (
								<TldrawUiToolbarToggleItem
									type="icon"
									key={item.value}
									data-testid={`style.animation.${item.value}`}
									aria-label={label + (isActive ? ` (${msg('style-panel.selected')})` : '')}
									tooltip={
										<>
											<div>{label}</div>
											{isActive ? <div>({msg('style-panel.selected')})</div> : null}
										</>
									}
									value={item.value}
									data-state={isActive ? 'on' : 'off'}
									data-isactive={isActive}
									title={label}
									onClick={() => handleValueChange(item.value)}
								>
									<TldrawUiButtonIcon icon={item.icon} />
								</TldrawUiToolbarToggleItem>
							)
						})}
					</TldrawUiRow>
				</TldrawUiToolbarToggleGroup>
			</TldrawUiToolbar>
		</>
	)
})
