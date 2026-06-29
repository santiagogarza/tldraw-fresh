import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultAnimationStyle = StyleProp.defineEnum('tldraw:animation', {
	defaultValue: 'none',
	values: ['none', 'spin', 'pulse', 'jiggle'],
})

/** @public */
export type TLDefaultAnimationStyle = T.TypeOf<typeof DefaultAnimationStyle>
