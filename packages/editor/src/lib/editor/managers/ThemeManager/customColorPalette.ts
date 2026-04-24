import type {
	TLDefaultColor,
	TLDefaultColorStyle,
	TLNamedColorStyle,
	TLTheme,
	TLThemeColors,
} from '@tldraw/tlschema'
import { isCustomColorStyle } from '@tldraw/tlschema'
import { exhaustiveSwitchError } from '@tldraw/utils'

/**
 * Custom color policy (SAN-7): the stored stroke hex is fixed. Fill/semi/pattern
 * and frame/note variants are derived in sRGB per the active light/dark palette
 * (same idea as named swatches, but from the custom base). A low-contrast hint
 * is shown in the picker when the stroke is hard to read on the page background.
 */

const HEX6 = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i

const WHITE = '#ffffff'
const NEAR_BLACK = '#0d0d0d'
const PATTERN_DESAT = 0.35

function parseHex6(hex: string): { r: number; g: number; b: number } {
	const m = hex.match(HEX6)
	if (!m) {
		return { r: 0, g: 0, b: 0 }
	}
	return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function relativeLuminance(hex: string): number {
	const { r, g, b } = parseHex6(hex)
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const s = c / 255
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	})
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function mixHex(a: string, b: string, t: number): string {
	const A = parseHex6(a)
	const B = parseHex6(b)
	const m = (c: number, d: number) => Math.round(c + (d - c) * t)
	return (
		'#' +
		[
			Math.max(0, Math.min(255, m(A.r, B.r))),
			Math.max(0, Math.min(255, m(A.g, B.g))),
			Math.max(0, Math.min(255, m(A.b, B.b))),
		]
			.map((c) => c.toString(16).padStart(2, '0'))
			.join('')
	)
}

/**
 * For a custom color, derive the same {@link TLDefaultColor} keys as a named swatch, fixed to the stroke hex
 * (fill/semi still adapt in sRGB; stroke hex is the user value).
 *
 * @public
 */
function getCustomColorValueForMode(
	color: { type: 'custom'; value: string },
	colors: TLThemeColors,
	variant: keyof TLDefaultColor
): string {
	const { value: baseHex } = color
	if (!isCustomColorStyle(color)) {
		throw new Error('Expected custom color object')
	}

	const pageBg = typeof colors.background === 'string' ? (colors.background as string) : '#f9fafb'
	const textHex = typeof colors.text === 'string' ? (colors.text as string) : '#000000'

	// Dark, saturated base reads better as "dark theme" tints; threshold matches prior heuristic
	const isDark = relativeLuminance(baseHex) < 0.45
	const onCanvasBg = isDark ? 'white' : 'black' // for semi blend target

	const frameFillCol = isDark ? mixHex(NEAR_BLACK, baseHex, 0.2) : mixHex(WHITE, baseHex, 0.88)
	const frameFillLum = relativeLuminance(frameFillCol)

	const noteFillCol = isDark ? mixHex(NEAR_BLACK, baseHex, 0.35) : mixHex(WHITE, baseHex, 0.55)

	void onCanvasBg

	switch (variant) {
		case 'solid':
		case 'fill':
		case 'linedFill': {
			return baseHex
		}
		case 'semi': {
			return isDark ? mixHex(NEAR_BLACK, baseHex, 0.22) : mixHex(pageBg, baseHex, 0.22)
		}
		case 'pattern': {
			return isDark
				? mixHex(mixHex(baseHex, WHITE, PATTERN_DESAT), WHITE, 0.1)
				: mixHex(mixHex(baseHex, NEAR_BLACK, PATTERN_DESAT), NEAR_BLACK, 0.1)
		}
		case 'frameHeadingStroke': {
			return isDark ? mixHex(NEAR_BLACK, baseHex, 0.65) : mixHex(WHITE, baseHex, 0.4)
		}
		case 'frameHeadingFill': {
			return isDark ? mixHex(NEAR_BLACK, baseHex, 0.2) : mixHex(WHITE, baseHex, 0.9)
		}
		case 'frameStroke': {
			return isDark ? mixHex(NEAR_BLACK, baseHex, 0.55) : mixHex(WHITE, baseHex, 0.35)
		}
		case 'frameFill': {
			return frameFillCol
		}
		case 'frameText': {
			if (isDark) {
				return frameFillLum > 0.55 ? textHex : '#f2f2f2'
			}
			return frameFillLum < 0.4 ? textHex : '#1d1d1d'
		}
		case 'noteFill': {
			return noteFillCol
		}
		case 'noteText': {
			return relativeLuminance(noteFillCol) < 0.4 ? '#f2f2f2' : textHex
		}
		case 'highlightSrgb': {
			return baseHex
		}
		case 'highlightP3': {
			const { r, g, b } = parseHex6(baseHex)
			return `color(display-p3 ${(r / 255).toFixed(4)} ${(g / 255).toFixed(4)} ${(b / 255).toFixed(4)})`
		}
		default:
			return exhaustiveSwitchError(variant)
	}
}

/**
 * @public
 */
export function getRelativeContrastAgainstCanvas(
	hex6: string,
	theme: TLTheme,
	colorMode: 'light' | 'dark'
) {
	const bg = theme.colors[colorMode].background
	const bgLum = typeof bg === 'string' ? relativeLuminance(bg) : 1
	const fgLum = relativeLuminance(hex6)
	const lighter = Math.max(fgLum, bgLum)
	const darker = Math.min(fgLum, bgLum)
	const ratio = (lighter + 0.05) / (darker + 0.05)
	return { ratio, isLowContrast: ratio < 3 }
}

/**
 * Resolves a color style value to its actual CSS color string for a given theme and variant.
 * If the color is not a default theme color, returns the color value as-is.
 *
 * @param colors - The color palette for the current color mode (e.g. `theme.colors[colorMode]`)
 * @param color - The color style value to resolve
 * @param variant - Which variant of the color to return (solid, fill, pattern, etc.)
 * @returns The CSS color string for the specified color and variant
 *
 * @public
 */
export function getColorValue(
	colors: TLThemeColors,
	color: TLDefaultColorStyle | string,
	variant: keyof TLDefaultColor
): string {
	if (isCustomColorStyle(color)) {
		return getCustomColorValueForMode(color, colors, variant)
	}
	// `color` is a named key after the custom branch; index without using `TLDefaultColorStyle` (includes object) as key type
	const colorEntry = (colors as TLThemeColors)[color as TLNamedColorStyle as keyof TLThemeColors]
	if (!colorEntry || typeof colorEntry === 'string') {
		return color
	}
	return (colorEntry as TLDefaultColor)[variant]
}
