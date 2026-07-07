import {
	DefaultKeyboardShortcutsDialog,
	DefaultKeyboardShortcutsDialogContent,
	DefaultToolbar,
	DefaultToolbarContent,
	TLComponents,
	TLUiAssetUrlOverrides,
	TLUiOverrides,
	TldrawUiMenuItem,
	Tldraw,
	useIsToolSelected,
	useTools,
} from 'tldraw'
import 'tldraw/tldraw.css'
import { RoundedRectangleShapeTool } from './RoundedRectangleShapeTool'
import { ROUNDED_RECTANGLE_TYPE, RoundedRectangleShapeUtil } from './RoundedRectangleShapeUtil'

// [1]
const shapeUtils = [RoundedRectangleShapeUtil]
const tools = [RoundedRectangleShapeTool]

// [2]
const uiOverrides: TLUiOverrides = {
	tools(_editor, uiTools) {
		uiTools[ROUNDED_RECTANGLE_TYPE] = {
			id: ROUNDED_RECTANGLE_TYPE,
			icon: 'geo-rounded-rect',
			label: 'Rounded rectangle',
			kbd: 'r',
			onSelect: (source) => {
				_editor.setCurrentTool(ROUNDED_RECTANGLE_TYPE, { source })
			},
		}
		return uiTools
	},
}

// [3]
const customAssetUrls: TLUiAssetUrlOverrides = {
	icons: {
		'geo-rounded-rect': '/geo-rounded-rect.svg',
	},
}

// [4]
const components: TLComponents = {
	Toolbar: (props) => {
		const uiTools = useTools()
		const isSelected = useIsToolSelected(uiTools[ROUNDED_RECTANGLE_TYPE])
		return (
			<DefaultToolbar {...props}>
				<TldrawUiMenuItem {...uiTools[ROUNDED_RECTANGLE_TYPE]} isSelected={isSelected} />
				<DefaultToolbarContent />
			</DefaultToolbar>
		)
	},
	KeyboardShortcutsDialog: (props) => {
		const uiTools = useTools()
		return (
			<DefaultKeyboardShortcutsDialog {...props}>
				<TldrawUiMenuItem {...uiTools[ROUNDED_RECTANGLE_TYPE]} />
				<DefaultKeyboardShortcutsDialogContent />
			</DefaultKeyboardShortcutsDialog>
		)
	},
}

// [5]
export default function RoundedRectangleExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				shapeUtils={shapeUtils}
				tools={tools}
				overrides={uiOverrides}
				assetUrls={customAssetUrls}
				components={components}
				onMount={(editor) => {
					// Seed the canvas with a few examples that show the range of the
					// corner radius, from a sharp box to a fully rounded pill.
					editor.createShapes([
						{
							type: ROUNDED_RECTANGLE_TYPE,
							x: 120,
							y: 120,
							props: { w: 200, h: 140, radius: 0, color: 'black', fill: 'none' },
						},
						{
							type: ROUNDED_RECTANGLE_TYPE,
							x: 360,
							y: 120,
							props: { w: 200, h: 140, radius: 24, color: 'blue', fill: 'semi' },
						},
						{
							type: ROUNDED_RECTANGLE_TYPE,
							x: 600,
							y: 120,
							props: { w: 200, h: 140, radius: 70, color: 'green', fill: 'solid' },
						},
					])
				}}
			/>
		</div>
	)
}

/*
[1]
Register the custom shape util and tool. Both arrays are declared outside of
the component so they aren't re-created on every render.

[2]
Add the rounded-rectangle tool to the UI so it shows up in the toolbar and
gets a keyboard shortcut (r).

[3]
Provide an SVG asset for the toolbar icon. The example's public/ folder
already has geo-rounded-rect.svg, which is a rounded-rectangle glyph.

[4]
Extend the default toolbar and keyboard shortcuts dialog to include the new
tool alongside the built-ins.

[5]
Pre-populate the canvas with three rounded rectangles at different corner
radii so the effect is obvious the moment the example loads. Select any of
them to reveal the corner-radius handle inside the top-left corner and drag
it toward the centre to make the shape more rounded.
*/
