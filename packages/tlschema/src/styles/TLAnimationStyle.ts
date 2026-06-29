import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default animation style property used by tldraw shapes for looping CSS animations.
 * Animations are purely presentational and do not affect geometry, hit-testing, or bounds.
 *
 * Available values:
 * - `none` - No animation
 * - `spin` - Bouncy continuous rotation
 * - `pulse` - Rhythmic scaling
 * - `jiggle` - Playful back-and-forth rotation
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
