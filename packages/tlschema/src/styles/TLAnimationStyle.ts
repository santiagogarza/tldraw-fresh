import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default animation style property used by tldraw shapes for purely presentational looping animation.
 * Controls how a shape's rendered DOM root is animated via CSS keyframes. The animation does not affect
 * geometry, bounds, snapping, hit-testing, or export.
 *
 * Available values:
 * - `none` - No animation (default)
 * - `spin` - Bouncy looping rotation
 * - `pulse` - Looping scale pulse
 * - `jiggle` - Wobbly back-and-forth rotation
 *
 * @example
 * ```ts
 * import { DefaultAnimationStyle } from '@tldraw/tlschema'
 *
 * // Use in shape props definition
 * interface MyShapeProps {
 *   animation: typeof DefaultAnimationStyle
 *   // other props...
 * }
 * ```
 *
 * @public
 */
export const DefaultAnimationStyle = StyleProp.defineEnum('tldraw:animation', {
	defaultValue: 'none',
	values: ['none', 'spin', 'pulse', 'jiggle'],
})

/**
 * Type representing a default animation style value.
 *
 * @public
 */
export type TLDefaultAnimationStyle = T.TypeOf<typeof DefaultAnimationStyle>
