import {
	DefaultColorStyle,
	DefaultFillStyle,
	DefaultSizeStyle,
	Polygon2d,
	Rectangle2d,
	ShapeUtil,
	T,
	TLDefaultColorStyle,
	TLDefaultFillStyle,
	TLDefaultSizeStyle,
	TLHandle,
	TLHandleDragInfo,
	TLResizeInfo,
	TLShape,
	Vec,
	ZERO_INDEX_KEY,
	getColorValue,
	resizeBox,
	useEditor,
} from 'tldraw'

// [1]
export const ROUNDED_RECTANGLE_TYPE = 'rounded-rectangle' as const

declare module 'tldraw' {
	export interface TLGlobalShapePropsMap {
		'rounded-rectangle': RoundedRectangleShapeProps
	}
}

// Stroke widths per size, matching the built-in geo shape sizes.
const STROKE_SIZES: Record<TLDefaultSizeStyle, number> = {
	s: 2,
	m: 3.5,
	l: 5,
	xl: 10,
}

// Points used to approximate a quarter-circle corner in the hit-test geometry.
// 8 segments is plenty for pixel-accurate selection without slowing anything down.
const CORNER_SEGMENTS = 8

// The corner-radius handle is drawn just inside the top-left corner, along the
// diagonal that runs from (0, 0) toward the shape's centre. Clamping the handle
// position to that diagonal gives the drag interaction one clear axis.

export interface RoundedRectangleShapeProps {
	w: number
	h: number
	radius: number
	color: TLDefaultColorStyle
	fill: TLDefaultFillStyle
	size: TLDefaultSizeStyle
}

export type RoundedRectangleShape = TLShape<typeof ROUNDED_RECTANGLE_TYPE>

/**
 * A rectangle with an adjustable corner radius. Selecting the shape reveals a
 * single handle inside the top-left corner — drag it toward the centre to make
 * the corners more rounded, or drag it into the corner to make them sharp.
 */
export class RoundedRectangleShapeUtil extends ShapeUtil<RoundedRectangleShape> {
	static override type = ROUNDED_RECTANGLE_TYPE

	// [2]
	static override props = {
		w: T.nonZeroNumber,
		h: T.nonZeroNumber,
		radius: T.positiveNumber,
		color: DefaultColorStyle,
		fill: DefaultFillStyle,
		size: DefaultSizeStyle,
	}

	override canEdit() {
		return false
	}

	override isAspectRatioLocked() {
		return false
	}

	getDefaultProps(): RoundedRectangleShapeProps {
		return {
			w: 220,
			h: 140,
			radius: 20,
			color: 'black',
			fill: 'none',
			size: 'm',
		}
	}

	// [3]
	getMaxRadius(shape: RoundedRectangleShape) {
		return Math.min(shape.props.w, shape.props.h) / 2
	}

	// [4]
	getGeometry(shape: RoundedRectangleShape) {
		const { w, h } = shape.props
		const isFilled = shape.props.fill !== 'none'
		const r = Math.min(shape.props.radius, this.getMaxRadius(shape))

		// A plain rectangle is fine when the corners aren't rounded.
		if (r <= 0) {
			return new Rectangle2d({ width: w, height: h, isFilled })
		}

		const points: Vec[] = []
		const corners: Array<{ cx: number; cy: number; startAngle: number }> = [
			{ cx: w - r, cy: r, startAngle: -Math.PI / 2 }, // top-right
			{ cx: w - r, cy: h - r, startAngle: 0 }, // bottom-right
			{ cx: r, cy: h - r, startAngle: Math.PI / 2 }, // bottom-left
			{ cx: r, cy: r, startAngle: Math.PI }, // top-left
		]
		for (const { cx, cy, startAngle } of corners) {
			for (let i = 0; i <= CORNER_SEGMENTS; i++) {
				const t = i / CORNER_SEGMENTS
				const angle = startAngle + t * (Math.PI / 2)
				points.push(new Vec(cx + r * Math.cos(angle), cy + r * Math.sin(angle)))
			}
		}

		return new Polygon2d({ points, isFilled })
	}

	// [5]
	override getHandles(shape: RoundedRectangleShape): TLHandle[] {
		const r = Math.min(shape.props.radius, this.getMaxRadius(shape))
		return [
			{
				id: 'corner-radius',
				type: 'vertex',
				label: 'Corner radius',
				index: ZERO_INDEX_KEY,
				x: r,
				y: r,
			},
		]
	}

	override onHandleDrag(
		shape: RoundedRectangleShape,
		{ handle }: TLHandleDragInfo<RoundedRectangleShape>
	) {
		// Project the handle position onto the diagonal from (0, 0) toward the
		// centre by averaging x and y. This lets users drag freely without the
		// handle jumping onto only one axis.
		const raw = (handle.x + handle.y) / 2
		const radius = Math.max(0, Math.min(raw, this.getMaxRadius(shape)))
		return {
			...shape,
			props: { ...shape.props, radius },
		}
	}

	// [6]
	override onResize(shape: RoundedRectangleShape, info: TLResizeInfo<RoundedRectangleShape>) {
		const next = resizeBox(shape, info)
		// Clamp the radius so it never exceeds half the smaller side.
		const maxRadius = Math.min(next.props.w, next.props.h) / 2
		return {
			...next,
			props: {
				...next.props,
				radius: Math.min(shape.props.radius, maxRadius),
			},
		}
	}

	// [7]
	component(shape: RoundedRectangleShape) {
		const { w, h, color, fill, size } = shape.props
		const r = Math.min(shape.props.radius, this.getMaxRadius(shape))

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const editor = useEditor()
		const theme = editor.getCurrentTheme()
		const colors = theme.colors[editor.getColorMode()]
		const strokeColor = getColorValue(colors, color, 'solid')
		const strokeWidth = STROKE_SIZES[size]

		let fillColor: string
		let fillOpacity = 1
		switch (fill) {
			case 'none':
				fillColor = 'transparent'
				break
			case 'semi':
				fillColor = getColorValue(colors, color, 'semi')
				break
			case 'solid':
			case 'pattern':
			case 'fill':
				fillColor = strokeColor
				fillOpacity = fill === 'solid' ? 1 : 0.5
				break
			default:
				fillColor = 'transparent'
		}

		return (
			<svg className="tl-svg-container">
				<rect
					x={strokeWidth / 2}
					y={strokeWidth / 2}
					width={Math.max(0, w - strokeWidth)}
					height={Math.max(0, h - strokeWidth)}
					rx={Math.max(0, r - strokeWidth / 2)}
					ry={Math.max(0, r - strokeWidth / 2)}
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					fill={fillColor}
					fillOpacity={fillOpacity}
				/>
			</svg>
		)
	}

	// [8]
	getIndicatorPath(shape: RoundedRectangleShape) {
		const { w, h } = shape.props
		const r = Math.min(shape.props.radius, this.getMaxRadius(shape))
		const path = new Path2D()
		if (r <= 0) {
			path.rect(0, 0, w, h)
			return path
		}
		path.moveTo(r, 0)
		path.lineTo(w - r, 0)
		path.arcTo(w, 0, w, r, r)
		path.lineTo(w, h - r)
		path.arcTo(w, h, w - r, h, r)
		path.lineTo(r, h)
		path.arcTo(0, h, 0, h - r, r)
		path.lineTo(0, r)
		path.arcTo(0, 0, r, 0, r)
		path.closePath()
		return path
	}
}

/*
[1]
Every custom shape needs a unique type string. We reuse the constant so the
tool, shape util, and callers stay in sync.

[2]
Props are validated by the store. We use tldraw's default color/fill/size
styles so the shape picks up all the built-in styling controls for free.

[3]
The corner radius is clamped to half the shape's smaller side — that's when
the rectangle becomes a pill or a circle. Beyond that, further increases have
no visual effect.

[4]
For click-testing, we approximate the rounded corners with a polygon. When
the radius is zero we use a plain Rectangle2d for speed.

[5]
`getHandles` places a single handle at (radius, radius). Dragging it moves
the handle in both axes; onHandleDrag projects that motion onto the diagonal
so the interaction has one clear feel.

[6]
When the shape is resized we clamp the radius so it never grows larger than
the shape can accommodate.

[7]
The component uses a plain SVG <rect> with rx/ry — the browser draws the
rounded corners exactly right. We inset the rect by half the stroke width so
the visible outline sits on the shape's bounds.

[8]
The selection indicator draws the same rounded outline using a Path2D.
*/
