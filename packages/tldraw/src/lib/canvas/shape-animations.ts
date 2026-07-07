import { TLShape } from '@tldraw/editor'

/**
 * The set of built-in shape animation options.
 *
 * @public
 */
export const TL_SHAPE_ANIMATIONS = ['none', 'spin', 'jiggle', 'shake'] as const

/**
 * A shape animation. Applied to a shape via its meta record so that the visual
 * animation persists with the shape and is preserved across sessions.
 *
 * @public
 */
export type TLShapeAnimation = (typeof TL_SHAPE_ANIMATIONS)[number]

/**
 * The `shape.meta` key used to persist a shape's animation.
 *
 * @public
 */
export const SHAPE_ANIMATION_META_KEY = 'tldrawAnimation'

/**
 * Read the animation applied to a shape. Returns `'none'` when no animation is
 * set.
 *
 * @public
 */
export function getShapeAnimation(shape: TLShape): TLShapeAnimation {
	const value = shape.meta[SHAPE_ANIMATION_META_KEY]
	if (value === 'spin' || value === 'jiggle' || value === 'shake') return value
	return 'none'
}

/**
 * Build the `meta` patch used to apply an animation to a shape. When `'none'`
 * is passed the animation key is cleared so the shape has no persisted
 * animation state.
 *
 * @public
 */
export function getShapeAnimationMetaPatch(
	shape: TLShape,
	animation: TLShapeAnimation
): TLShape['meta'] {
	const next = { ...shape.meta }
	if (animation === 'none') {
		delete next[SHAPE_ANIMATION_META_KEY]
	} else {
		next[SHAPE_ANIMATION_META_KEY] = animation
	}
	return next
}
