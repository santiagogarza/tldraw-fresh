import {
	ArrowShapeArrowheadEndStyle,
	ArrowShapeArrowheadStartStyle,
	ArrowShapeKindStyle,
	DefaultColorStyle,
	DefaultDashStyle,
	DefaultFillStyle,
	DefaultFontStyle,
	DefaultHorizontalAlignStyle,
	DefaultSizeStyle,
	DefaultTextAlignStyle,
	DefaultVerticalAlignStyle,
	GeoShapeGeoStyle,
	getColorValue,
	isHexColor,
	kickoutOccludedShapes,
	LineShapeSplineStyle,
	minBy,
	normalizeHexColor,
	TLArrowShapeArrowheadStyle,
	TLDefaultColorStyle,
	useEditor,
	useValue,
} from '@tldraw/editor'
import React, { useCallback, useMemo, useRef } from 'react'
import { GeoShapeUtil } from '../../../shapes/geo/GeoShapeUtil'
import { getColorStyleItems, getFontStyleItems, STYLES } from '../../../styles'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { TldrawUiGrid, TldrawUiRow } from '../primitives/layout'
import {
	TldrawUiPopover,
	TldrawUiPopoverContent,
	TldrawUiPopoverTrigger,
} from '../primitives/TldrawUiPopover'
import { TldrawUiSlider } from '../primitives/TldrawUiSlider'
import {
	TldrawUiToolbar,
	TldrawUiToolbarButton,
	TldrawUiToolbarToggleGroup,
	TldrawUiToolbarToggleItem,
} from '../primitives/TldrawUiToolbar'
import { CustomColorPicker } from './CustomColorPicker'
import { StylePanelButtonPicker, StylePanelButtonPickerInline } from './StylePanelButtonPicker'
import { useStylePanelContext } from './StylePanelContext'
import { StylePanelDoubleDropdownPicker } from './StylePanelDoubleDropdownPicker'
import {
	StylePanelDropdownPicker,
	StylePanelDropdownPickerInline,
} from './StylePanelDropdownPicker'
import { StylePanelSubheading } from './StylePanelSubheading'
import { useRecentColors } from './useRecentColors'

/** @public @react */
export function DefaultStylePanelContent() {
	return (
		<>
			<StylePanelSection>
				<StylePanelColorPicker />
				<StylePanelOpacityPicker />
			</StylePanelSection>
			<StylePanelSection>
				<StylePanelFillPicker />
				<StylePanelDashPicker />
				<StylePanelSizePicker />
			</StylePanelSection>
			<StylePanelSection>
				<StylePanelFontPicker />
				<StylePanelTextAlignPicker />
				<StylePanelLabelAlignPicker />
			</StylePanelSection>
			<StylePanelSection>
				<StylePanelGeoShapePicker />
				<StylePanelArrowKindPicker />
				<StylePanelArrowheadPicker />
				<StylePanelSplinePicker />
			</StylePanelSection>
		</>
	)
}

/** @public */
export interface StylePanelSectionProps {
	children: React.ReactNode
}

/** @public @react */
export function StylePanelSection({ children }: StylePanelSectionProps) {
	return <div className="tlui-style-panel__section">{children}</div>
}

/** @public @react */
export function StylePanelColorPicker() {
	const editor = useEditor()
	const theme = editor.getCurrentTheme()
	const colorMode = editor.getColorMode()
	const colors = theme.colors[colorMode]
	const { styles, onValueChange, onHistoryMark } = useStylePanelContext()
	const msg = useTranslation()
	const { recent, push: pushRecent } = useRecentColors()

	const color = styles.get(DefaultColorStyle)
	const presetItems = useMemo(() => getColorStyleItems(colors), [colors])

	const pendingCustomRef = useRef<string | null>(null)

	const applyColor = useCallback(
		(value: string, { markHistory = true, updateRecent = true } = {}) => {
			if (markHistory) onHistoryMark?.('custom-color picker')
			onValueChange(DefaultColorStyle, value)
			if (updateRecent) pushRecent(value)
		},
		[onValueChange, onHistoryMark, pushRecent]
	)

	// Close-handler: commit the most-recent pending scrub value (add to recent, mark history).
	const handleCustomOpenChange = useCallback(
		(next: boolean) => {
			if (!next && pendingCustomRef.current) {
				const hex = pendingCustomRef.current
				pendingCustomRef.current = null
				pushRecent(hex)
			}
		},
		[pushRecent]
	)

	if (color === undefined) return null

	const title = msg('style-panel.color')
	const customTitle = msg('style-panel.color.custom')
	const currentColorValue = color.type === 'shared' ? color.value : undefined
	const currentHex = isHexColor(currentColorValue ?? '') ? currentColorValue! : undefined
	const initialPickerValue =
		currentHex ??
		(currentColorValue ? getColorValue(colors, currentColorValue, 'solid') : '#000000')

	return (
		<div className="tlui-style-panel__color-section">
			{recent.length > 0 && (
				<div className="tlui-style-panel__recent-colors" data-testid="style.color.recent">
					<StylePanelSubheading>{msg('style-panel.color.recent')}</StylePanelSubheading>
					<TldrawUiToolbar
						orientation="horizontal"
						label={msg('style-panel.color.recent')}
						className="tlui-style-panel__recent-colors__toolbar"
					>
						<TldrawUiToolbarToggleGroup
							data-testid="style.color.recent.group"
							type="single"
							value={currentColorValue ?? null}
						>
							<TldrawUiRow>
								{recent.map((recentColor) => {
									const isHex = isHexColor(recentColor)
									const swatchColor = isHex
										? recentColor
										: getColorValue(colors, recentColor as TLDefaultColorStyle, 'solid')
									const isActive =
										color.type === 'shared' &&
										(isHex && isHexColor(color.value)
											? normalizeHexColor(color.value) === normalizeHexColor(recentColor)
											: color.value === recentColor)
									return (
										<TldrawUiToolbarToggleItem
											type="icon"
											key={recentColor}
											data-id={recentColor}
											data-testid={`style.color.recent.${recentColor}`}
											aria-label={recentColor}
											tooltip={recentColor}
											value={recentColor}
											data-state={isActive ? 'on' : 'off'}
											data-isactive={isActive}
											title={recentColor}
											style={{ color: swatchColor }}
											onClick={() => applyColor(recentColor, { updateRecent: true })}
										>
											<TldrawUiButtonIcon icon="color" />
										</TldrawUiToolbarToggleItem>
									)
								})}
							</TldrawUiRow>
						</TldrawUiToolbarToggleGroup>
					</TldrawUiToolbar>
				</div>
			)}
			<StylePanelSubheading>{title}</StylePanelSubheading>
			<TldrawUiToolbar label={title}>
				<TldrawUiToolbarToggleGroup
					data-testid="style.color"
					type="single"
					value={color.type === 'shared' ? color.value : null}
					asChild
				>
					<TldrawUiGrid>
						{presetItems.map((item) => {
							const isActive = color.type === 'shared' && color.value === item.value
							const label = title + ' — ' + msg(`color-style.${item.value}` as any)
							return (
								<TldrawUiToolbarToggleItem
									type="icon"
									key={item.value}
									data-id={item.value}
									data-testid={`style.color.${item.value}`}
									aria-label={label + (isActive ? ` (${msg('style-panel.selected')})` : '')}
									tooltip={
										<>
											<div>{label}</div>
											{isActive ? <div>({msg('style-panel.selected')})</div> : null}
										</>
									}
									value={item.value}
									data-state={isActive ? 'on' : 'off'}
									data-isactive={isActive}
									title={label}
									style={{ color: getColorValue(colors, item.value as TLDefaultColorStyle, 'solid') }}
									onClick={() => applyColor(item.value)}
								>
									<TldrawUiButtonIcon icon={item.icon} />
								</TldrawUiToolbarToggleItem>
							)
						})}
						<TldrawUiPopover id="custom color picker" onOpenChange={handleCustomOpenChange}>
							<TldrawUiPopoverTrigger>
								<TldrawUiButton
									type="icon"
									className="tlui-button__custom-color"
									data-testid="style.color.custom"
									title={customTitle}
									aria-label={customTitle}
									data-isactive={!!currentHex}
									style={currentHex ? { color: currentHex } : undefined}
								>
									{currentHex ? (
										<TldrawUiButtonIcon icon="color" />
									) : (
										<CustomColorTriggerSwatch />
									)}
								</TldrawUiButton>
							</TldrawUiPopoverTrigger>
							<TldrawUiPopoverContent side="right" align="start">
								<CustomColorPicker
									value={initialPickerValue}
									onChange={(hex) => {
										pendingCustomRef.current = hex
										applyColor(hex, { markHistory: false, updateRecent: false })
									}}
									onCommit={(hex) => {
										pendingCustomRef.current = null
										applyColor(hex)
									}}
								/>
							</TldrawUiPopoverContent>
						</TldrawUiPopover>
					</TldrawUiGrid>
				</TldrawUiToolbarToggleGroup>
			</TldrawUiToolbar>
		</div>
	)
}

/** Swatch shown on the custom-color trigger when no custom hex is active. */
function CustomColorTriggerSwatch() {
	return (
		<span
			aria-hidden
			className="tlui-custom-color-trigger__swatch"
			style={{
				backgroundImage:
					'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
			}}
		/>
	)
}

const tldrawSupportedOpacities = [0.1, 0.25, 0.5, 0.75, 1] as const
/** @public @react */
export function StylePanelOpacityPicker() {
	const editor = useEditor()
	const { onHistoryMark, onOpacityChange, enhancedA11yMode } = useStylePanelContext()

	const opacity = useValue('opacity', () => editor.getSharedOpacity(), [editor])
	const msg = useTranslation()

	const handleOpacityValueChange = React.useCallback(
		(value: number) => {
			onOpacityChange(tldrawSupportedOpacities[value])
		},
		[onOpacityChange]
	)

	if (opacity === undefined) return null

	const opacityIndex =
		opacity.type === 'mixed'
			? -1
			: tldrawSupportedOpacities.indexOf(
					minBy(tldrawSupportedOpacities, (supportedOpacity) =>
						Math.abs(supportedOpacity - opacity.value)
					)!
				)

	return (
		<>
			{enhancedA11yMode && (
				<StylePanelSubheading>{msg('style-panel.opacity')}</StylePanelSubheading>
			)}
			<TldrawUiSlider
				data-testid="style.opacity"
				value={opacityIndex >= 0 ? opacityIndex : tldrawSupportedOpacities.length - 1}
				label={opacity.type === 'mixed' ? 'style-panel.mixed' : `opacity-style.${opacity.value}`}
				onValueChange={handleOpacityValueChange}
				steps={tldrawSupportedOpacities.length - 1}
				title={msg('style-panel.opacity')}
				onHistoryMark={onHistoryMark}
				ariaValueModifier={25}
			/>
		</>
	)
}

/** @public @react */
export function StylePanelFillPicker() {
	const { styles, enhancedA11yMode } = useStylePanelContext()
	const msg = useTranslation()
	const fill = styles.get(DefaultFillStyle)
	if (fill === undefined) return null

	const title = msg('style-panel.fill')

	return (
		<>
			{enhancedA11yMode && <StylePanelSubheading>{title}</StylePanelSubheading>}
			<TldrawUiToolbar orientation="horizontal" label={title}>
				<StylePanelButtonPickerInline
					title={title}
					uiType="fill"
					style={DefaultFillStyle}
					items={STYLES.fill}
					value={fill}
				/>
				<StylePanelDropdownPickerInline
					type="icon"
					id="fill-extra"
					uiType="fill"
					testIdType="fill-extra"
					stylePanelType="fill"
					style={DefaultFillStyle}
					items={STYLES.fillExtra}
					value={fill}
				/>
			</TldrawUiToolbar>
		</>
	)
}

/** @public @react */
export function StylePanelDashPicker() {
	const { styles } = useStylePanelContext()
	const msg = useTranslation()
	const dash = styles.get(DefaultDashStyle)
	if (dash === undefined) return null

	return (
		<StylePanelButtonPicker
			title={msg('style-panel.dash')}
			uiType="dash"
			style={DefaultDashStyle}
			items={STYLES.dash}
			value={dash}
		/>
	)
}

/** @public @react */
export function StylePanelSizePicker() {
	const editor = useEditor()
	const { styles, onValueChange } = useStylePanelContext()
	const msg = useTranslation()
	const size = styles.get(DefaultSizeStyle)
	if (size === undefined) return null

	return (
		<StylePanelButtonPicker
			title={msg('style-panel.size')}
			uiType="size"
			style={DefaultSizeStyle}
			items={STYLES.size}
			value={size}
			onValueChange={(style, value) => {
				onValueChange(style, value)
				const selectedShapeIds = editor.getSelectedShapeIds()
				if (selectedShapeIds.length > 0) {
					kickoutOccludedShapes(editor, selectedShapeIds)
				}
			}}
		/>
	)
}

/** @public @react */
export function StylePanelFontPicker() {
	const editor = useEditor()
	const theme = editor.getCurrentTheme()
	const { styles } = useStylePanelContext()
	const msg = useTranslation()
	const font = styles.get(DefaultFontStyle)
	if (font === undefined) return null

	return (
		<StylePanelButtonPicker
			title={msg('style-panel.font')}
			uiType="font"
			style={DefaultFontStyle}
			items={getFontStyleItems(theme)}
			value={font}
		/>
	)
}

/** @public @react */
export function StylePanelTextAlignPicker() {
	const { styles, enhancedA11yMode } = useStylePanelContext()
	const msg = useTranslation()
	const textAlign = styles.get(DefaultTextAlignStyle)
	if (textAlign === undefined) return null
	const title = msg('style-panel.align')

	return (
		<>
			{enhancedA11yMode && <StylePanelSubheading>{title}</StylePanelSubheading>}
			<TldrawUiToolbar orientation="horizontal" label={title}>
				<StylePanelButtonPickerInline
					title={title}
					uiType="align"
					style={DefaultTextAlignStyle}
					items={STYLES.textAlign}
					value={textAlign}
				/>
				<TldrawUiToolbarButton
					type="icon"
					title={msg('style-panel.vertical-align')}
					data-testid="vertical-align"
					disabled
				>
					<TldrawUiButtonIcon icon="vertical-align-middle" />
				</TldrawUiToolbarButton>
			</TldrawUiToolbar>
		</>
	)
}

/** @public @react */
export function StylePanelLabelAlignPicker() {
	const { styles, enhancedA11yMode } = useStylePanelContext()
	const msg = useTranslation()
	const labelAlign = styles.get(DefaultHorizontalAlignStyle)
	const verticalLabelAlign = styles.get(DefaultVerticalAlignStyle)
	if (labelAlign === undefined) return null
	const title = msg('style-panel.label-align')

	return (
		<>
			{enhancedA11yMode && <StylePanelSubheading>{title}</StylePanelSubheading>}
			<TldrawUiToolbar orientation="horizontal" label={title}>
				<StylePanelButtonPickerInline
					title={title}
					uiType="align"
					style={DefaultHorizontalAlignStyle}
					items={STYLES.horizontalAlign}
					value={labelAlign}
				/>
				{verticalLabelAlign === undefined ? (
					<TldrawUiToolbarButton
						type="icon"
						title={msg('style-panel.vertical-align')}
						data-testid="vertical-align"
						disabled
					>
						<TldrawUiButtonIcon icon="vertical-align-middle" />
					</TldrawUiToolbarButton>
				) : (
					<StylePanelDropdownPickerInline
						type="icon"
						id="geo-vertical-alignment"
						uiType="verticalAlign"
						stylePanelType="vertical-align"
						style={DefaultVerticalAlignStyle}
						items={STYLES.verticalAlign}
						value={verticalLabelAlign}
					/>
				)}
			</TldrawUiToolbar>
		</>
	)
}

/** @public @react */
export function StylePanelGeoShapePicker() {
	const editor = useEditor()
	const { styles } = useStylePanelContext()
	const geo = styles.get(GeoShapeGeoStyle)
	if (geo === undefined) return null

	const customGeoStyles = (editor.getShapeUtil('geo') as GeoShapeUtil).options.customGeoStyles
	const customItems = customGeoStyles
		? Object.entries(customGeoStyles).map(([value, def]) => ({ value, icon: def.icon }))
		: []
	const items =
		customItems.length > 0
			? [...STYLES.geo.filter((item) => !customGeoStyles?.[item.value]), ...customItems]
			: STYLES.geo

	return (
		<StylePanelDropdownPicker
			label="style-panel.geo"
			type="menu"
			id="geo"
			uiType="geo"
			stylePanelType="geo"
			style={GeoShapeGeoStyle}
			items={items}
			value={geo}
		/>
	)
}

/** @public @react */
export function StylePanelArrowKindPicker() {
	const { styles } = useStylePanelContext()
	const arrowKind = styles.get(ArrowShapeKindStyle)
	if (arrowKind === undefined) return null

	return (
		<StylePanelDropdownPicker
			id="arrow-kind"
			type="menu"
			label={'style-panel.arrow-kind'}
			uiType="arrow-kind"
			stylePanelType="arrow-kind"
			style={ArrowShapeKindStyle}
			items={STYLES.arrowKind}
			value={arrowKind}
		/>
	)
}

/** @public @react */
export function StylePanelArrowheadPicker() {
	const { styles } = useStylePanelContext()
	const arrowheadEnd = styles.get(ArrowShapeArrowheadEndStyle)
	const arrowheadStart = styles.get(ArrowShapeArrowheadStartStyle)
	if (arrowheadEnd === undefined || arrowheadStart === undefined) return null

	return (
		<StylePanelDoubleDropdownPicker<TLArrowShapeArrowheadStyle>
			label={'style-panel.arrowheads'}
			uiTypeA="arrowheadStart"
			styleA={ArrowShapeArrowheadStartStyle}
			itemsA={STYLES.arrowheadStart}
			valueA={arrowheadStart}
			uiTypeB="arrowheadEnd"
			styleB={ArrowShapeArrowheadEndStyle}
			itemsB={STYLES.arrowheadEnd}
			valueB={arrowheadEnd}
			labelA="style-panel.arrowhead-start"
			labelB="style-panel.arrowhead-end"
		/>
	)
}

/** @public @react */
export function StylePanelSplinePicker() {
	const { styles } = useStylePanelContext()
	const spline = styles.get(LineShapeSplineStyle)
	if (spline === undefined) return null

	return (
		<StylePanelDropdownPicker
			type="menu"
			id="spline"
			uiType="spline"
			stylePanelType="spline"
			label="style-panel.spline"
			style={LineShapeSplineStyle}
			items={STYLES.spline}
			value={spline}
		/>
	)
}
