import { TLGeoShape, useEditor, useValue } from '@tldraw/editor'
import { PatternFill } from '../shared/PatternFill'
import {
	GEO_SHAPE_CORNER_RADIUS_PREVIEW_VERSION_KEY,
	GeoTypeDefinition,
	getGeoShapeCornerRadiusPreviewVersion,
	getGeoShapePath,
} from './getGeoShapePath'

export function GeoShapeBody({
	shape,
	shouldScale,
	forceSolid,
	strokeColor,
	strokeWidth: unscaledStrokeWidth,
	fillColor,
	patternFillFallbackColor,
	customGeoTypes,
}: {
	shape: TLGeoShape
	shouldScale: boolean
	forceSolid: boolean
	strokeColor: string
	strokeWidth: number
	fillColor: string
	patternFillFallbackColor: string
	customGeoTypes?: Record<string, GeoTypeDefinition>
}) {
	const editor = useEditor()
	const scaleToUse = shouldScale ? shape.props.scale : 1
	const strokeWidth = unscaledStrokeWidth * scaleToUse
	const { dash, fill } = shape.props
	useValue('geo corner radius preview version', getGeoShapeCornerRadiusPreviewVersion, [])
	useValue(
		'geo corner radius preview editor version',
		() => editor.getInstanceState().meta[GEO_SHAPE_CORNER_RADIUS_PREVIEW_VERSION_KEY],
		[editor]
	)

	const path = getGeoShapePath(shape, unscaledStrokeWidth, customGeoTypes)
	const fillPath =
		dash === 'draw' && !forceSolid
			? path.toDrawD({ strokeWidth, randomSeed: shape.id, passes: 1, offset: 0, onlyFilled: true })
			: path.toD({ onlyFilled: true })

	return (
		<>
			{fill === 'none' ? null : fill === 'pattern' ? (
				<PatternFill
					d={fillPath}
					fillColor={fillColor}
					patternFillFallbackColor={patternFillFallbackColor}
					scale={scaleToUse}
				/>
			) : (
				<path fill={fillColor} d={fillPath} />
			)}
			{path.toSvg({
				style: dash,
				strokeWidth,
				forceSolid,
				randomSeed: shape.id,
				props: { fill: 'none', stroke: strokeColor },
			})}
		</>
	)
}
