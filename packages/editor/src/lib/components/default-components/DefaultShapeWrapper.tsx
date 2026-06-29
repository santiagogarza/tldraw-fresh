import { useValue } from '@tldraw/state-react'
import { TLShape } from '@tldraw/tlschema'
import classNames from 'classnames'
import { forwardRef, ReactNode } from 'react'
import { useEditor } from '../../hooks/useEditor'

/** @public */
export interface TLShapeWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	/** The shape being rendered. */
	shape: TLShape
	/** Whether this is the shapes regular, or background component. */
	isBackground: boolean
	/** The shape's rendered component. */
	children: ReactNode
}

/** @public @react */
export const DefaultShapeWrapper = forwardRef(function DefaultShapeWrapper(
	{ children, shape, isBackground, ...props }: TLShapeWrapperProps,
	ref: React.Ref<HTMLDivElement>
) {
	const editor = useEditor()
	const isFilledShape = 'fill' in shape.props && shape.props.fill !== 'none'
	const animation = 'animation' in shape.props ? shape.props.animation : 'none'
	const shouldAnimate = useValue('shape animation speed', () => editor.user.getAnimationSpeed() !== 0, [
		editor,
	])

	return (
		<div
			ref={ref}
			data-shape-type={shape.type}
			data-shape-is-filled={isBackground ? undefined : isFilledShape}
			data-shape-id={shape.id}
			draggable={false}
			{...props}
			className={classNames('tl-shape', isBackground && 'tl-shape-background', props.className)}
		>
			<div
				className={classNames(
					'tl-shape__content',
					shouldAnimate && animation !== 'none' && `tl-shape__content--animation-${animation}`
				)}
			>
				{children}
			</div>
		</div>
	)
})
