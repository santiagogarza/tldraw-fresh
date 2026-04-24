import { EnumStyleProp } from './StyleProp'
import { TLDefaultColor, TLThemeDefaultColors, TLThemes } from './TLTheme'

/**
 * The names of all available shape colors, derived from {@link TLThemeDefaultColors}.
 * Extend {@link TLThemeDefaultColors} to add custom color names.
 *
 * At runtime, the color style also accepts arbitrary hex color strings of the form
 * `#RRGGBB` (or `#RGB`) set via the custom color picker; those values are not reflected
 * in this union because they're not a finite set of literals.
 *
 * @public
 */
export type TLDefaultColorStyle = {
	[K in keyof TLThemeDefaultColors]: TLThemeDefaultColors[K] extends TLDefaultColor ? K : never
}[keyof TLThemeDefaultColors] &
	string

/**
 * Regex that matches a 3-, 6-, or 8-character hex color string. The leading `#` is required.
 *
 * @internal
 */
export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

/**
 * Returns true if the given value is a hex color string of the form `#RRGGBB`, `#RGB`, or
 * `#RRGGBBAA`.
 *
 * @public
 */
export function isHexColor(value: unknown): value is string {
	return typeof value === 'string' && HEX_COLOR_REGEX.test(value)
}

/**
 * Normalizes a hex color string to lowercase `#RRGGBB` form. Short-form (`#RGB`) inputs are
 * expanded to their full 6-digit equivalent. Returns the input unchanged if it isn't a
 * recognizable hex color.
 *
 * @public
 */
export function normalizeHexColor(value: string): string {
	if (!isHexColor(value)) return value
	const hex = value.slice(1)
	if (hex.length === 3) {
		return ('#' + hex.split('').map((c) => c + c).join('')).toLowerCase()
	}
	return value.toLowerCase()
}

/**
 * Used only for initial values of the color style; the source of truth has moved to TLTheme.
 *
 * @internal
 */
const defaultColorNames: TLDefaultColorStyle[] = [
	'black',
	'grey',
	'light-violet',
	'violet',
	'blue',
	'light-blue',
	'yellow',
	'orange',
	'green',
	'light-green',
	'light-red',
	'red',
	'white',
] as const

class ColorStyleProp<T extends string> extends EnumStyleProp<T> {
	/** @internal */
	constructor(id: string, defaultValue: T, values: readonly T[]) {
		super(id, defaultValue, values)
	}

	override validate(value: unknown) {
		if (isHexColor(value)) return normalizeHexColor(value) as T
		return super.validate(value)
	}

	override validateUsingKnownGoodVersion(prevValue: T, newValue: unknown) {
		if (isHexColor(newValue)) return normalizeHexColor(newValue) as T
		return super.validateUsingKnownGoodVersion(prevValue, newValue)
	}
}

/**
 * The color style prop used by tldraw's default shapes. Accepts the named theme colors
 * registered via {@link registerColorsFromThemes} as well as custom hex color strings
 * (e.g. `#ff00aa`).
 *
 * @public
 */
export const DefaultColorStyle: EnumStyleProp<TLDefaultColorStyle> = new ColorStyleProp(
	'tldraw:color',
	'black' as TLDefaultColorStyle,
	defaultColorNames
)

/**
 * @public
 */
export const DefaultLabelColorStyle: EnumStyleProp<TLDefaultColorStyle> = new ColorStyleProp(
	'tldraw:labelColor',
	'black' as TLDefaultColorStyle,
	defaultColorNames
)

/**
 * Scan theme definitions and sync color registrations to match.
 * A color entry is any key in `TLThemeColors` whose value is an object
 * (i.e. a {@link TLDefaultColor}), as opposed to utility strings like
 * `background` or `text`.
 *
 * Colors present in themes but not yet registered will be added.
 * Colors currently registered but absent from all themes will be removed.
 *
 * @public
 */
export function registerColorsFromThemes(definitions: TLThemes): void {
	const colorNames = new Set<TLDefaultColorStyle>()
	for (const def of Object.values(definitions)) {
		for (const colorPalette of [def.colors.light, def.colors.dark]) {
			for (const [key, value] of Object.entries(colorPalette)) {
				if (typeof value === 'object' && value !== null) {
					colorNames.add(key as TLDefaultColorStyle)
				}
			}
		}
	}
	if (colorNames.size > 0) {
		DefaultColorStyle.addValues(...colorNames)
		DefaultLabelColorStyle.addValues(...colorNames)
	}

	const toRemove = DefaultColorStyle.values.filter((v) => !colorNames.has(v as TLDefaultColorStyle))
	if (toRemove.length > 0) {
		DefaultColorStyle.removeValues(...toRemove)
		DefaultLabelColorStyle.removeValues(...toRemove)
	}

	if (process.env.NODE_ENV !== 'production') {
		for (const def of Object.values(definitions)) {
			for (const color of colorNames) {
				if (!(color in def.colors.light)) {
					console.warn(
						`Theme '${def.id}' light palette is missing color '${color}'. Shapes using this color won't render correctly.`
					)
				}
				if (!(color in def.colors.dark)) {
					console.warn(
						`Theme '${def.id}' dark palette is missing color '${color}'. Shapes using this color won't render correctly.`
					)
				}
			}
		}
	}
}
