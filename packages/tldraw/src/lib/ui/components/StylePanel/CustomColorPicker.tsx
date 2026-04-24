import { isHexColor, normalizeHexColor } from '@tldraw/editor'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'

/** @public */
export interface CustomColorPickerProps {
	/** The current hex color value to show in the picker. */
	value: string
	/** Fired while the user is scrubbing the color wheel (rapid updates). */
	onChange(value: string): void
	/** Fired when the user commits a value (blur / Enter / closing picker). */
	onCommit(value: string): void
	/** Fired when the user clicks Cancel or otherwise bails without applying. */
	onCancel?(): void
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	if (!isHexColor(hex)) return null
	const normalized = normalizeHexColor(hex)
	const r = parseInt(normalized.slice(1, 3), 16)
	const g = parseInt(normalized.slice(3, 5), 16)
	const b = parseInt(normalized.slice(5, 7), 16)
	return { r, g, b }
}

function rgbToHex(r: number, g: number, b: number): string {
	const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v || 0)))
	const hex = (v: number) => clamp(v).toString(16).padStart(2, '0')
	return `#${hex(r)}${hex(g)}${hex(b)}`
}

/**
 * A simple color picker panel exposing a visual color wheel (via native color input), a HEX
 * text input, and three RGB channel inputs. Applying / committing happens live as the user
 * scrubs the wheel; the HEX and RGB fields validate on blur / Enter.
 *
 * @public @react
 */
export function CustomColorPicker({ value, onChange, onCommit, onCancel }: CustomColorPickerProps) {
	const msg = useTranslation()
	const normalizedInitial = isHexColor(value) ? normalizeHexColor(value) : '#000000'
	const rgb = hexToRgb(normalizedInitial) ?? { r: 0, g: 0, b: 0 }

	const [hexInput, setHexInput] = useState(normalizedInitial)
	const [rInput, setRInput] = useState(String(rgb.r))
	const [gInput, setGInput] = useState(String(rgb.g))
	const [bInput, setBInput] = useState(String(rgb.b))
	const [hexError, setHexError] = useState(false)
	const appliedRef = useRef(normalizedInitial)

	// Keep inputs in sync when the incoming value changes (e.g. user scrubs the wheel)
	useEffect(() => {
		if (!isHexColor(value)) return
		const normalized = normalizeHexColor(value)
		if (normalized === appliedRef.current) return
		const next = hexToRgb(normalized)
		if (!next) return
		appliedRef.current = normalized
		setHexInput(normalized)
		setRInput(String(next.r))
		setGInput(String(next.g))
		setBInput(String(next.b))
		setHexError(false)
	}, [value])

	const applyColor = useCallback(
		(hex: string, commit = false) => {
			const normalized = normalizeHexColor(hex)
			appliedRef.current = normalized
			const channels = hexToRgb(normalized)
			if (channels) {
				setRInput(String(channels.r))
				setGInput(String(channels.g))
				setBInput(String(channels.b))
			}
			setHexInput(normalized)
			setHexError(false)
			if (commit) onCommit(normalized)
			else onChange(normalized)
		},
		[onChange, onCommit]
	)

	const handleWheelChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			applyColor(e.target.value, false)
		},
		[applyColor]
	)
	const handleWheelCommit = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			applyColor(e.target.value, true)
		},
		[applyColor]
	)

	const commitHexInput = useCallback(() => {
		let next = hexInput.trim()
		if (next && !next.startsWith('#')) next = '#' + next
		if (!isHexColor(next)) {
			setHexError(true)
			return
		}
		applyColor(next, true)
	}, [hexInput, applyColor])

	const hexInputId = useId()
	const rId = useId()
	const gId = useId()
	const bId = useId()

	const commitRgbInput = useCallback(() => {
		const r = parseInt(rInput, 10)
		const g = parseInt(gInput, 10)
		const b = parseInt(bInput, 10)
		if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return
		const hex = rgbToHex(r, g, b)
		applyColor(hex, true)
	}, [rInput, gInput, bInput, applyColor])

	const previewHex = appliedRef.current

	return (
		<div className="tlui-custom-color-picker" data-testid="custom-color-picker">
			<div className="tlui-custom-color-picker__preview" style={{ backgroundColor: previewHex }}>
				<input
					type="color"
					className="tlui-custom-color-picker__wheel"
					value={previewHex}
					onChange={handleWheelChange}
					onBlur={handleWheelCommit}
					data-testid="custom-color-picker.wheel"
					aria-label={msg('custom-color-picker.wheel')}
				/>
			</div>
			<div className="tlui-custom-color-picker__field">
				<label htmlFor={hexInputId}>{msg('custom-color-picker.hex')}</label>
				<input
					id={hexInputId}
					type="text"
					spellCheck={false}
					autoComplete="off"
					className={
						'tlui-custom-color-picker__input' +
						(hexError ? ' tlui-custom-color-picker__input--error' : '')
					}
					value={hexInput}
					onChange={(e) => setHexInput(e.target.value)}
					onBlur={commitHexInput}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault()
							commitHexInput()
						}
					}}
					placeholder="#RRGGBB"
					data-testid="custom-color-picker.hex"
					aria-invalid={hexError}
				/>
			</div>
			<div className="tlui-custom-color-picker__rgb">
				<div className="tlui-custom-color-picker__field">
					<label htmlFor={rId}>R</label>
					<input
						id={rId}
						type="number"
						min={0}
						max={255}
						className="tlui-custom-color-picker__input"
						value={rInput}
						onChange={(e) => setRInput(e.target.value)}
						onBlur={commitRgbInput}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault()
								commitRgbInput()
							}
						}}
						data-testid="custom-color-picker.r"
					/>
				</div>
				<div className="tlui-custom-color-picker__field">
					<label htmlFor={gId}>G</label>
					<input
						id={gId}
						type="number"
						min={0}
						max={255}
						className="tlui-custom-color-picker__input"
						value={gInput}
						onChange={(e) => setGInput(e.target.value)}
						onBlur={commitRgbInput}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault()
								commitRgbInput()
							}
						}}
						data-testid="custom-color-picker.g"
					/>
				</div>
				<div className="tlui-custom-color-picker__field">
					<label htmlFor={bId}>B</label>
					<input
						id={bId}
						type="number"
						min={0}
						max={255}
						className="tlui-custom-color-picker__input"
						value={bInput}
						onChange={(e) => setBInput(e.target.value)}
						onBlur={commitRgbInput}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault()
								commitRgbInput()
							}
						}}
						data-testid="custom-color-picker.b"
					/>
				</div>
			</div>
			{onCancel && (
				<div className="tlui-custom-color-picker__actions">
					<TldrawUiButton
						type="normal"
						onClick={onCancel}
						data-testid="custom-color-picker.cancel"
					>
						{msg('custom-color-picker.cancel')}
					</TldrawUiButton>
				</div>
			)}
		</div>
	)
}
