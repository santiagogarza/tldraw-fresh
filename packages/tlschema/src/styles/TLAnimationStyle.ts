import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default animation style property used by tldraw shapes for looping CSS animations.
 *
 * Available values:
 * - `none` - No animation
 * - `spin` - Continuous rotation with a bouncy overshoot
 * - `pulse` - Scale pulsing effect
 * - `jiggle` - Subtle rotation wobble
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
