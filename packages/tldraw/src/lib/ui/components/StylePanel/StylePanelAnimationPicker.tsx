import { TLShape, useEditor, useValue } from '@tldraw/editor'
import { memo, useCallback, useRef } from 'react'
import {
	getShapeAnimation,
	getShapeAnimationMetaPatch,
	TL_SHAPE_ANIMATIONS,
	TLShapeAnimation,
} from '../../../canvas/shape-animations'
import { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiRow } from '../primitives/layout'
import {
	TldrawUiToolbar,
	TldrawUiToolbarToggleGroup,
	TldrawUiToolbarToggleItem,
} from '../primitives/TldrawUiToolbar'
import { useStylePanelContext } from './StylePanelContext'
import { StylePanelSubheading } from './StylePanelSubheading'

function getSharedShapeAnimation(shapes: TLShape[]): TLShapeAnimation | 'mixed' {
	if (shapes.length === 0) return 'none'
	const first = getShapeAnimation(shapes[0])
	for (let i = 1; i < shapes.length; i++) {
		if (getShapeAnimation(shapes[i]) !== first) return 'mixed'
	}
	return first
}

/**
 * A style panel section that lets the user pick an animation to apply to the
 * currently selected shapes. The animation is stored on each shape's `meta`
 * record and rendered by the {@link TldrawShapeWrapper}.
 *
 * @public @react
 */
export const StylePanelAnimationPicker = memo(function StylePanelAnimationPicker() {
	const editor = useEditor()
	const { onHistoryMark, enhancedA11yMode } = useStylePanelContext()
	const msg = useTranslation()

	const selection = useValue(
		'style panel animation selection',
		() => {
			if (!editor.isIn('select')) return null
			const selectedShapes = editor.getSelectedShapes()
			if (selectedShapes.length === 0) return null
			return {
				shapes: selectedShapes,
				value: getSharedShapeAnimation(selectedShapes),
			}
		},
		[editor]
	)

	// Track the latest selection so click handlers can read it without
	// re-registering as the user moves through the picker.
	const selectionRef = useRef(selection)
	selectionRef.current = selection

	const applyAnimation = useCallback(
		(next: TLShapeAnimation) => {
			const current = selectionRef.current
			if (!current) return
			if (current.value === next) return

			onHistoryMark('set shape animation')
			editor.run(() => {
				editor.updateShapes(
					current.shapes.map((shape) => ({
						id: shape.id,
						type: shape.type,
						meta: getShapeAnimationMetaPatch(shape, next),
					}))
				)
			})
		},
		[editor, onHistoryMark]
	)

	if (!selection) return null

	const title = msg('style-panel.animation')
	const groupValue = selection.value === 'mixed' ? '' : selection.value

	return (
		<>
			{enhancedA11yMode && <StylePanelSubheading>{title}</StylePanelSubheading>}
			<TldrawUiToolbar label={title}>
				<TldrawUiToolbarToggleGroup
					data-testid="style.animation"
					type="single"
					value={groupValue}
					asChild
				>
					<TldrawUiRow>
						{TL_SHAPE_ANIMATIONS.map((animation) => {
							const isActive = selection.value === animation
							const label = msg(`animation-style.${animation}` as TLUiTranslationKey)
							const a11yLabel =
								title + ' — ' + label + (isActive ? ` (${msg('style-panel.selected')})` : '')
							return (
								<TldrawUiToolbarToggleItem
									key={animation}
									type="tool"
									value={animation}
									data-testid={`style.animation.${animation}`}
									data-state={isActive ? 'on' : 'off'}
									data-isactive={isActive}
									aria-label={a11yLabel}
									tooltip={label}
									title={label}
									onClick={() => applyAnimation(animation)}
								>
									<span className="tlui-button__label">{label}</span>
								</TldrawUiToolbarToggleItem>
							)
						})}
					</TldrawUiRow>
				</TldrawUiToolbarToggleGroup>
			</TldrawUiToolbar>
		</>
	)
})
