import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default animation style property used by tldraw shapes. Controls a looping
 * decorative animation applied to the rendered shape.
 *
 * Available values:
 * - `none` - No animation (default)
 * - `spin` - The shape continuously rotates around its center
 * - `jiggle` - The shape wobbles back and forth with a slight rotation
 * - `shake` - The shape rapidly translates side to side
 *
 * @public
 */
export const DefaultAnimationStyle = StyleProp.defineEnum('tldraw:animation', {
	defaultValue: 'none',
	values: ['none', 'spin', 'jiggle', 'shake'],
})

/**
 * Type representing a default animation style value.
 *
 * @public
 */
export type TLDefaultAnimationStyle = T.TypeOf<typeof DefaultAnimationStyle>
