import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default animation style property used by tldraw shapes for looping CSS animations.
 * Controls a purely presentational, looping animation applied to the shape's rendered
 * DOM root. It does not affect the shape's geometry, bounds, hit-testing, or export.
 *
 * Available values:
 * - `none` - No animation
 * - `spin` - Continuous bouncy rotation
 * - `pulse` - Scale up and down
 * - `jiggle` - Small rocking rotation back and forth
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
 *
 * // Create a shape with a spinning animation
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
	values: ['none', 'spin', 'pulse', 'jiggle'],
})

/**
 * Type representing a default animation style value.
 * This is a union type of all available animation style options.
 *
 * @example
 * ```ts
 * import { TLDefaultAnimationStyle } from '@tldraw/tlschema'
 *
 * // Valid animation style values
 * const noneStyle: TLDefaultAnimationStyle = 'none'
 * const spinStyle: TLDefaultAnimationStyle = 'spin'
 * const pulseStyle: TLDefaultAnimationStyle = 'pulse'
 * const jiggleStyle: TLDefaultAnimationStyle = 'jiggle'
 * ```
 *
 * @public
 */
export type TLDefaultAnimationStyle = T.TypeOf<typeof DefaultAnimationStyle>
