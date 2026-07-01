import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default animation style property used by tldraw shapes to apply a looping
 * animation to the shape while it is on the canvas.
 *
 * Available values:
 * - `none` - No animation, the shape is static
 * - `spin` - Continuous rotation around the shape's center
 * - `jiggle` - Small back-and-forth rotation
 * - `shake` - Small back-and-forth horizontal translation
 *
 * @example
 * ```ts
 * import { DefaultAnimationStyle } from '@tldraw/tlschema'
 *
 * // Create a shape with a spin animation
 * const shape = {
 *   // ... other properties
 *   props: {
 *     animation: 'spin' as const,
 *     // ... other props
 *   }
 * }
 * ```
 *
 * @public
 */
export const DefaultAnimationStyle = StyleProp.defineEnum('tldraw:animation', {
	defaultValue: 'none',
	values: ['none', 'spin', 'jiggle', 'shake'],
})

/**
 * Type representing a default animation style value.
 * This is a union type of all available animation options.
 *
 * @public
 */
export type TLDefaultAnimationStyle = T.TypeOf<typeof DefaultAnimationStyle>
