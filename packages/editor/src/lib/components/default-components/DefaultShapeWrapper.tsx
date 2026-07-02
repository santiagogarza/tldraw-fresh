import { DefaultAnimationStyle, TLDefaultAnimationStyle, TLShape } from '@tldraw/tlschema'
import classNames from 'classnames'
import { forwardRef, ReactNode } from 'react'
import { useMaybeEditor } from '../../hooks/useEditor'
import { useValue } from '@tldraw/state-react'

/** @public */
export interface TLShapeWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	/** The shape being rendered. */
	shape: TLShape
	/** Whether this is the shapes regular, or background component. */
	isBackground: boolean
	/** The shape's rendered component. */
	children: ReactNode
}

function getShapeAnimation(shape: TLShape): TLDefaultAnimationStyle | undefined {
	if ('animation' in shape.props) {
		return DefaultAnimationStyle.validate(shape.props.animation)
	}
	return undefined
}

/** @public @react */
export const DefaultShapeWrapper = forwardRef(function DefaultShapeWrapper(
	{ children, shape, isBackground, ...props }: TLShapeWrapperProps,
	ref: React.Ref<HTMLDivElement>
) {
	const isFilledShape = 'fill' in shape.props && shape.props.fill !== 'none'
	const editor = useMaybeEditor()
	const prefersReducedMotion = useValue(
		'prefersReducedMotion',
		() => editor?.user.getAnimationSpeed() === 0,
		[editor]
	)

	const animation = getShapeAnimation(shape)
	const animationClass =
		!isBackground && !prefersReducedMotion && animation && animation !== 'none'
			? `tl-shape-animation-${animation}`
			: undefined

	return (
		<div
			ref={ref}
			data-shape-type={shape.type}
			data-shape-is-filled={isBackground ? undefined : isFilledShape}
			data-shape-id={shape.id}
			data-shape-animation={animation}
			draggable={false}
			{...props}
			className={classNames(
				'tl-shape',
				isBackground && 'tl-shape-background',
				animationClass,
				props.className
			)}
		>
			{children}
		</div>
	)
})
