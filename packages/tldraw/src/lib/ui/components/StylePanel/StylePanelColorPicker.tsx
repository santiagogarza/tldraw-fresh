import {
	DefaultColorStyle,
	TLDefaultColorStyle,
	TLNamedColorStyle,
	elementShouldCaptureKeys,
	getColorValue,
	getRelativeContrastAgainstCanvas,
	isCustomColorStyle,
	track,
	useEditor,
} from '@tldraw/editor'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { getColorStyleItems } from '../../../styles'
import { PORTRAIT_BREAKPOINT } from '../../constants'
import { useBreakpoint } from '../../context/breakpoints'
import { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { TldrawUiColumn, TldrawUiGrid, TldrawUiRow } from '../primitives/layout'
import { TldrawUiInput } from '../primitives/TldrawUiInput'
import {
	TldrawUiPopover,
	TldrawUiPopoverContent,
	TldrawUiPopoverTrigger,
} from '../primitives/TldrawUiPopover'
import {
	TldrawUiToolbar,
	TldrawUiToolbarToggleGroup,
	TldrawUiToolbarToggleItem,
} from '../primitives/TldrawUiToolbar'
import { useStylePanelContext } from './StylePanelContext'
import { StylePanelSubheading } from './StylePanelSubheading'

const FALLBACK = '#888888'

function parseRgb(hex: string) {
	const t = hex.replace(/^#/, '')
	if (!/^[0-9A-Fa-f]{6}$/i.test(t)) return { r: 0, g: 0, b: 0 }
	return {
		r: parseInt(t.slice(0, 2), 16),
		g: parseInt(t.slice(2, 4), 16),
		b: parseInt(t.slice(4, 6), 16),
	}
}

function normalizeHex(input: string): string | null {
	const t = input.trim().replace(/^#/, '')
	if (!/^[0-9A-Fa-f]{6}$/i.test(t)) return null
	return `#${t.toLowerCase()}`
}

function rgbToHex6(r: number, g: number, b: number) {
	return (
		'#' +
		[
			Math.max(0, Math.min(255, Math.round(r))),
			Math.max(0, Math.min(255, Math.round(g))),
			Math.max(0, Math.min(255, Math.round(b))),
		]
			.map((c) => c.toString(16).padStart(2, '0'))
			.join('')
	)
}

function idForRecent(c: TLDefaultColorStyle) {
	return isCustomColorStyle(c) ? `custom:${c.value}` : (c as string)
}

/** @public @react */
export const StylePanelColorPicker = track(function StylePanelColorPicker() {
	const editor = useEditor()
	const theme = editor.getCurrentTheme()
	const colorMode = editor.getColorMode()
	const palette = theme.colors[colorMode]
	const {
		styles,
		enhancedA11yMode,
		onValueChange,
		onColorStyleApplied,
		onHistoryMark,
		recentShapeColors,
	} = useStylePanelContext()
	const msg = useTranslation()
	const breakpoint = useBreakpoint()
	const title = msg('style-panel.color')

	const color = styles.get(DefaultColorStyle)
	if (color === undefined) return null

	const [pickerOpen, setPickerOpen] = useState(false)
	const [draftHex, setDraftHex] = useState(FALLBACK)
	const [hexField, setHexField] = useState(FALLBACK)
	const [rField, setR] = useState('0')
	const [gField, setG] = useState('0')
	const [bField, setB] = useState('0')
	const [fieldErr, setFieldErr] = useState(false)

	const rPoint = useRef(false)
	const rAct = useRef<HTMLElement | null>(null)

	const items = getColorStyleItems(palette)

	const toggleValue =
		color.type === 'shared'
			? isCustomColorStyle(color.value)
				? 'custom'
				: (color.value as string)
			: null

	const apply = useCallback(
		(c: TLDefaultColorStyle) => {
			onHistoryMark('point picker item')
			onValueChange(DefaultColorStyle, c)
			onColorStyleApplied(c)
		},
		[onHistoryMark, onValueChange, onColorStyleApplied]
	)

	const setDraftFrom = useCallback((h: string) => {
		const n = normalizeHex(h)
		if (!n) return
		const { r, g, b } = parseRgb(n)
		setDraftHex(n)
		setHexField(n)
		setR(String(r))
		setG(String(g))
		setB(String(b))
		setFieldErr(false)
	}, [])

	useEffect(() => {
		if (!pickerOpen) return
		if (color.type !== 'shared') {
			setDraftFrom(FALLBACK)
			return
		}
		if (isCustomColorStyle(color.value)) {
			setDraftFrom(color.value.value)
		} else {
			setDraftFrom(getColorValue(palette, color.value, 'solid'))
		}
	}, [pickerOpen, color, palette, setDraftFrom])

	const contrast = useMemo(
		() => getRelativeContrastAgainstCanvas(draftHex, theme, colorMode),
		[draftHex, theme, colorMode]
	)

	const {
		handleButtonClick,
		handleButtonPointerDown,
		handleButtonPointerEnter,
		handleButtonPointerUp,
	} = useMemo(() => {
		const pu = () => {
			rPoint.current = false
			editor.getContainerWindow().removeEventListener('pointerup', pu)
			const a = rAct.current
			if (a && elementShouldCaptureKeys(a, false)) a.focus()
			else if (breakpoint >= PORTRAIT_BREAKPOINT.TABLET_SM) editor.getContainer().focus()
			rAct.current = null
		}

		const fromId = (id: string | undefined): TLDefaultColorStyle | null => {
			if (!id) return null
			if (id.startsWith('custom:')) return { type: 'custom' as const, value: id.slice(7) }
			return id as TLNamedColorStyle
		}

		const handleButtonClick = (e: React.PointerEvent<HTMLButtonElement>) => {
			const { id } = e.currentTarget.dataset
			if (!id) return
			if (id === 'custom' || id === 'custom-trigger') return
			const next = fromId(id)
			if (!next) return
			if (
				color.type === 'shared' &&
				(isCustomColorStyle(color.value)
					? id === `custom:${color.value.value}`
					: (color.value as string) === id)
			) {
				return
			}
			apply(next)
		}

		const handleButtonPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
			const { id } = e.currentTarget.dataset
			if (!id) return
			if (id === 'custom' || id === 'custom-trigger') return
			const next = fromId(id)
			if (next) apply(next)
			rPoint.current = true
			rAct.current = editor.getContainerDocument().activeElement as HTMLElement
			editor.getContainerWindow().addEventListener('pointerup', pu)
		}

		const handleButtonPointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
			if (!rPoint.current) return
			const { id } = e.currentTarget.dataset
			if (id && id !== 'custom' && id !== 'custom-trigger') {
				const n = fromId(id)
				if (n) apply(n)
			}
		}

		const handleButtonPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
			const { id } = e.currentTarget.dataset
			if (!id || id === 'custom' || id === 'custom-trigger') return
			const n = fromId(id)
			if (n) apply(n)
		}
		return {
			handleButtonClick,
			handleButtonPointerDown,
			handleButtonPointerEnter,
			handleButtonPointerUp,
		}
	}, [editor, breakpoint, color, apply])

	const applyCustomHex = useCallback(() => {
		const n = normalizeHex(hexField) ?? normalizeHex(draftHex)
		if (!n) {
			setFieldErr(true)
			return
		}
		apply({ type: 'custom', value: n })
		setPickerOpen(false)
	}, [apply, hexField, draftHex])

	return (
		<>
			{enhancedA11yMode && <StylePanelSubheading>{title}</StylePanelSubheading>}
			<TldrawUiToolbar label={title}>
				{recentShapeColors.length > 0 && (
					<TldrawUiRow className="tlui-style-color__recents" data-testid="style.color.recent-row">
						<span className="tlui-style-color__recents-label">
							{msg('style-panel.recent-colors')}
						</span>
						<TldrawUiRow>
							{Array.from({ length: 4 }, (_, i) => {
								const c = recentShapeColors[i]
								if (!c) {
									return (
										<div
											key={i}
											className="tlui-style-color__spacer"
											style={{ width: 28, height: 28 }}
											aria-hidden
										/>
									)
								}
								const id = idForRecent(c)
								const sol = isCustomColorStyle(c) ? c.value : getColorValue(palette, c, 'solid')
								const active =
									color.type === 'shared' && idForRecent(c) === idForRecent(color.value)
								return (
									<TldrawUiButton
										key={id + i}
										type="icon"
										data-id={id}
										data-testid={`style.color.recent.${i}`}
										aria-pressed={active}
										aria-label={title}
										title={isCustomColorStyle(c) ? c.value : c}
										style={{
											color: sol,
											border: active ? '1px solid var(--tl-color-selected)' : undefined,
										}}
										onPointerDown={handleButtonPointerDown}
										onPointerUp={handleButtonPointerUp}
										onPointerEnter={handleButtonPointerEnter}
										onClick={handleButtonClick}
									>
										<TldrawUiButtonIcon icon="color" small />
									</TldrawUiButton>
								)
							})}
						</TldrawUiRow>
					</TldrawUiRow>
				)}

				<TldrawUiColumn>
					<TldrawUiToolbarToggleGroup
						data-testid="style.color"
						type="single"
						value={toggleValue}
						asChild
					>
						<TldrawUiGrid>
							{items.map((item) => {
								const isActive =
									color.type === 'shared' &&
									!isCustomColorStyle(color.value) &&
									color.value === item.value
								const label = title + ' — ' + msg(`color-style.${item.value}` as TLUiTranslationKey)
								return (
									<TldrawUiToolbarToggleItem
										type="icon"
										key={item.value}
										data-id={item.value}
										data-testid={`style.color.${item.value}`}
										aria-label={label + (isActive ? ` (${msg('style-panel.selected')})` : '')}
										tooltip={label}
										value={item.value}
										data-state={isActive ? 'on' : 'off'}
										title={label}
										style={{
											color: getColorValue(palette, item.value as TLDefaultColorStyle, 'solid'),
										}}
										onPointerEnter={handleButtonPointerEnter}
										onPointerDown={handleButtonPointerDown}
										onPointerUp={handleButtonPointerUp}
										onClick={handleButtonClick}
									>
										<TldrawUiButtonIcon icon={item.icon} />
									</TldrawUiToolbarToggleItem>
								)
							})}

							<TldrawUiPopover
								id="tldraw-custom-color"
								open={pickerOpen}
								onOpenChange={setPickerOpen}
							>
								<TldrawUiPopoverTrigger>
									<TldrawUiToolbarToggleItem
										type="icon"
										data-id="custom-trigger"
										data-testid="style.color.custom"
										aria-label={msg('color-style.custom')}
										value="custom"
										data-state={
											color.type === 'shared' && isCustomColorStyle(color.value) ? 'on' : 'off'
										}
										title={msg('color-style.custom')}
										style={
											color.type === 'shared' && isCustomColorStyle(color.value)
												? { color: color.value.value }
												: undefined
										}
										onPointerDown={(e) => e.stopPropagation()}
										onClick={() => setPickerOpen(true)}
									>
										<TldrawUiButtonIcon icon="plus" small />
									</TldrawUiToolbarToggleItem>
								</TldrawUiPopoverTrigger>
								<TldrawUiPopoverContent side="left" align="end">
									<TldrawUiColumn
										className="tlui-style-color__picker"
										data-testid="style.color.picker"
									>
										<HexColorPicker
											color={draftHex}
											onChange={(h) => {
												setDraftFrom(h)
											}}
										/>
										{contrast.isLowContrast && (
											<p className="tlui-hint" role="status">
												{msg('color-style.low-contrast')} ({contrast.ratio.toFixed(1)}:1)
											</p>
										)}
										<TldrawUiInput
											aria-label={msg('color-style.picker-hex')}
											data-testid="style.color.picker-hex"
											value={hexField}
											onValueChange={(v) => {
												setHexField(v)
												if (normalizeHex(v)) {
													setFieldErr(false)
												} else {
													setFieldErr(true)
												}
											}}
											onComplete={() => {
												const n = normalizeHex(hexField)
												if (n) setDraftFrom(n)
											}}
										/>
										<TldrawUiRow>
											<TldrawUiInput
												aria-label={msg('color-style.picker-r')}
												data-testid="style.color.picker-r"
												value={rField}
												onValueChange={(v) => {
													setR(v)
													const n = parseInt(v, 10)
													if (Number.isFinite(n) && n >= 0 && n <= 255) {
														const p = parseRgb(draftHex)
														setDraftFrom(rgbToHex6(n, p.g, p.b))
													} else {
														setFieldErr(true)
													}
												}}
											/>
											<TldrawUiInput
												aria-label={msg('color-style.picker-g')}
												data-testid="style.color.picker-g"
												value={gField}
												onValueChange={(v) => {
													setG(v)
													const n = parseInt(v, 10)
													if (Number.isFinite(n) && n >= 0 && n <= 255) {
														const p = parseRgb(draftHex)
														setDraftFrom(rgbToHex6(p.r, n, p.b))
													} else {
														setFieldErr(true)
													}
												}}
											/>
											<TldrawUiInput
												aria-label={msg('color-style.picker-b')}
												data-testid="style.color.picker-b"
												value={bField}
												onValueChange={(v) => {
													setB(v)
													const n = parseInt(v, 10)
													if (Number.isFinite(n) && n >= 0 && n <= 255) {
														const p = parseRgb(draftHex)
														setDraftFrom(rgbToHex6(p.r, p.g, n))
													} else {
														setFieldErr(true)
													}
												}}
											/>
										</TldrawUiRow>
										{fieldErr && (
											<p className="tlui-hint tlui-hint--error">
												{msg('color-style.picker-error')}
											</p>
										)}
										<TldrawUiButton
											type="primary"
											data-testid="style.color.picker-apply"
											onClick={applyCustomHex}
										>
											{msg('color-style.picker-apply')}
										</TldrawUiButton>
									</TldrawUiColumn>
								</TldrawUiPopoverContent>
							</TldrawUiPopover>
						</TldrawUiGrid>
					</TldrawUiToolbarToggleGroup>
				</TldrawUiColumn>
			</TldrawUiToolbar>
		</>
	)
})
