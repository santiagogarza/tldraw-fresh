import { TLShapeWrapperProps } from '@tldraw/editor'
import classNames from 'classnames'
import { forwardRef } from 'react'

/**
 * The animation kinds supported by `TldrawShapeWrapper`. Stored on each shape
 * as `shape.meta.animation`. An absent value is treated as `'none'`.
 *
 * @public
 */
export type TLTldrawAnimationKind = 'none' | 'jiggle' | 'spin' | 'pulse'

const ANIMATION_KINDS: ReadonlySet<TLTldrawAnimationKind> = new Set([
	'none',
	'jiggle',
	'spin',
	'pulse',
])

function getShapeAnimation(meta: unknown): TLTldrawAnimationKind {
	if (meta && typeof meta === 'object' && 'animation' in meta) {
		const value = (meta as { animation?: unknown }).animation
		if (typeof value === 'string' && ANIMATION_KINDS.has(value as TLTldrawAnimationKind)) {
			return value as TLTldrawAnimationKind
		}
	}
	return 'none'
}

/**
 * The tldraw package's default {@link @tldraw/editor#TLShapeWrapperProps | ShapeWrapper}.
 * It is a thin extension of the editor's `DefaultShapeWrapper` that adds an
 * inner wrapper element driving CSS animations via the `data-tl-animation`
 * attribute. The animation kind is read from `shape.meta.animation`.
 *
 * The outer `div.tl-shape` keeps the editor-managed page transform, width,
 * height, opacity, z-index and clip-path. The inner `div.tl-shape-animation`
 * is owned by CSS only, so keyframe transforms on it compose cleanly with
 * the outer transform and never fight the editor's reactive updates.
 *
 * Note: the shape's indicator (selection outline) and hit-test geometry come
 * from `ShapeUtil.getGeometry` and do not move with the animation. This keeps
 * selection and hit-testing stable while shapes wiggle, spin, or pulse.
 *
 * @public @react
 */
export const TldrawShapeWrapper = forwardRef(function TldrawShapeWrapper(
	{ children, shape, isBackground, ...props }: TLShapeWrapperProps,
	ref: React.Ref<HTMLDivElement>
) {
	const isFilledShape = 'fill' in shape.props && shape.props.fill !== 'none'
	const animation = getShapeAnimation(shape.meta)

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
			<div className="tl-shape-animation" data-tl-animation={animation}>
				{children}
			</div>
		</div>
	)
})
