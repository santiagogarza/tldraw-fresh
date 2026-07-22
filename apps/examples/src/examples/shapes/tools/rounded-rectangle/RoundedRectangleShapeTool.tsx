import { BaseBoxShapeTool } from 'tldraw'
import { ROUNDED_RECTANGLE_TYPE } from './RoundedRectangleShapeUtil'

/**
 * The tool for creating rounded rectangles. Extending BaseBoxShapeTool gives us
 * click-and-drag creation, click-to-place at the default size, and all the
 * usual state machine behavior for free.
 */
export class RoundedRectangleShapeTool extends BaseBoxShapeTool {
	static override id = ROUNDED_RECTANGLE_TYPE
	static override initial = 'idle'
	override shapeType = 'rounded-rectangle' as const
}
