import { T } from '@tldraw/validate'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/TLShape'
import { RecordProps } from '../recordsWithProps'
import { DefaultAnimationStyle, TLDefaultAnimationStyle } from '../styles/TLAnimationStyle'
import { DefaultColorStyle, TLDefaultColorStyle } from '../styles/TLColorStyle'
import { TLBaseShape } from './TLBaseShape'

/**
 * Properties for the frame shape, which provides a container for organizing other shapes.
 *
 * @public
 */
export interface TLFrameShapeProps {
	/** Width of the frame in pixels */
	w: number
	/** Height of the frame in pixels */
	h: number
	/** Display name for the frame (shown in UI) */
	name: string
	/** Color style for the frame border and label */
	color: TLDefaultColorStyle
	/** Looping animation style applied to the rendered shape (presentational only) */
	animation: TLDefaultAnimationStyle
}

/**
 * A frame shape provides a container for organizing and grouping other shapes.
 * Frames can be used to create sections, organize content, or define specific areas.
 *
 * @public
 * @example
 * ```ts
 * const frameShape: TLFrameShape = {
 *   id: createShapeId(),
 *   typeName: 'shape',
 *   type: 'frame',
 *   x: 0,
 *   y: 0,
 *   rotation: 0,
 *   index: 'a1',
 *   parentId: 'page:page1',
 *   isLocked: false,
 *   opacity: 1,
 *   props: {
 *     w: 400,
 *     h: 300,
 *     name: 'Header Section',
 *     color: 'blue'
 *   },
 *   meta: {}
 * }
 * ```
 */
export type TLFrameShape = TLBaseShape<'frame', TLFrameShapeProps>

/**
 * Validation schema for frame shape properties.
 *
 * @public
 * @example
 * ```ts
 * // Validate frame properties
 * const isValidName = frameShapeProps.name.isValid('My Frame')
 * const isValidColor = frameShapeProps.color.isValid('red')
 * ```
 */
export const frameShapeProps: RecordProps<TLFrameShape> = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	name: T.string,
	// because shape colors are an option, we don't want them to be picked up by the editor as a
	// style prop by default, so instead of a proper style we just supply an equivalent validator.
	// Check `FrameShapeUtil.configure` for how we replace this with the original
	// `DefaultColorStyle` style when the option is turned on.
	// We delegate to DefaultColorStyle.validate so custom colors from themes are
	// picked up automatically.
	color: { validate: (v: unknown) => DefaultColorStyle.validate(v) as TLDefaultColorStyle },
	animation: DefaultAnimationStyle,
}

const Versions = createShapePropsMigrationIds('frame', {
	AddColorProp: 1,
	AddAnimation: 2,
})

/**
 * Version identifiers for frame shape migrations.
 *
 * @public
 */
export { Versions as frameShapeVersions }

/**
 * Migration sequence for frame shape properties across different schema versions.
 * Handles adding color properties to existing frame shapes.
 *
 * @public
 */
export const frameShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: Versions.AddColorProp,
			up: (props) => {
				props.color = 'black'
			},
			down: (props) => {
				delete props.color
			},
		},
		{
			id: Versions.AddAnimation,
			up: (props) => {
				props.animation = 'none'
			},
			down: (props) => {
				delete props.animation
			},
		},
	],
})
