import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/**
 * Default animation style property used by tldraw shapes.
 *
 * @public
 */
export const DefaultAnimationStyle = StyleProp.defineEnum('tldraw:animation', {
	defaultValue: 'none',
	values: ['none', 'jiggle', 'spin', 'pulse'],
})

/** @public */
export type TLDefaultAnimationStyle = T.TypeOf<typeof DefaultAnimationStyle>
