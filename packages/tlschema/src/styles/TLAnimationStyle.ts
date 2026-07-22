import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default animation style property used by tldraw shapes.
 * Controls looping CSS animations applied to shapes on the canvas.
 *
 * Available values:
 * - `none` - No animation
 * - `spin` - Continuous rotation
 * - `jiggle` - Wobbling rotation
 * - `shake` - Horizontal shaking
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
