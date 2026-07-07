import { DefaultShapeWrapper, TLShapeWrapperProps } from '@tldraw/editor'
import { forwardRef } from 'react'
import { getShapeAnimation } from './shape-animations'

/**
 * The default {@link @tldraw/editor#TLShapeWrapperProps | ShapeWrapper} used
 * by the {@link Tldraw} component.
 *
 * Extends {@link @tldraw/editor#DefaultShapeWrapper} to render an animation
 * layer inside the shape wrapper. The animation layer applies a persisted
 * animation (spin, jiggle or shake) from the shape's meta record without
 * interfering with the shape wrapper's own transform.
 *
 * @public @react
 */
export const TldrawShapeWrapper = forwardRef(function TldrawShapeWrapper(
	{ children, shape, isBackground, ...props }: TLShapeWrapperProps,
	ref: React.Ref<HTMLDivElement>
) {
	const animation = getShapeAnimation(shape)

	return (
		<DefaultShapeWrapper ref={ref} shape={shape} isBackground={isBackground} {...props}>
			{animation === 'none' ? (
				children
			) : (
				<div className="tl-shape__animation" data-animation={animation}>
					{children}
				</div>
			)}
		</DefaultShapeWrapper>
	)
})
