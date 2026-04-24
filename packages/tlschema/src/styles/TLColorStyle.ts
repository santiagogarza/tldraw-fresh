import { T } from '@tldraw/validate'
import {
	type TLCustomColorStyle,
	customColorStyleValidator,
	isCustomColorStyle,
} from './customColorStyle'
import { StyleProp } from './StyleProp'
import { TLDefaultColor, TLThemeDefaultColors, TLThemes } from './TLTheme'

/**
 * The names of all available shape colors, derived from {@link TLThemeDefaultColors}.
 * Extend {@link TLThemeDefaultColors} to add custom color names.
 *
 * @public
 */
export type TLNamedColorStyle = {
	[K in keyof TLThemeDefaultColors]: TLThemeDefaultColors[K] extends TLDefaultColor ? K : never
}[keyof TLThemeDefaultColors] &
	string

/**
 * Shape stroke/fill color: a named theme palette entry or a fixed custom {@link TLCustomColorStyle}.
 *
 * @public
 */
export type TLDefaultColorStyle = TLNamedColorStyle | TLCustomColorStyle

// Re-export for custom branch checks in UI
export { isCustomColorStyle, type TLCustomColorStyle } from './customColorStyle'

const defaultColorNames: readonly TLNamedColorStyle[] = [
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
] as const

const validNamedColors = new Set<string>(defaultColorNames)

const namedColorStyleValidator: T.Validator<TLNamedColorStyle> = new T.Validator(
	(value) => {
		if (typeof value !== 'string' || !validNamedColors.has(value)) {
			throw new T.ValidationError('Expected a named theme color string')
		}
		return value as TLNamedColorStyle
	},
	(known, next) => {
		if (Object.is(known, next)) return known
		return namedColorStyleValidator.validate(next)
	}
)

const defaultColorValueValidator: T.Validator<TLDefaultColorStyle> = T.or(
	namedColorStyleValidator,
	customColorStyleValidator
) as T.Validator<TLDefaultColorStyle>

/** @public */
export class ColorStyleProp extends StyleProp<TLDefaultColorStyle> {
	/** Only named palette color names (excludes the custom object branch) */
	values: TLNamedColorStyle[]

	/** @internal */
	constructor(id: 'tldraw:color' | 'tldraw:labelColor', defaultValue: TLDefaultColorStyle) {
		super(id, defaultValue, defaultColorValueValidator)
		this.values = [...defaultColorNames] as TLNamedColorStyle[]
	}

	override setDefaultValue(value: TLDefaultColorStyle) {
		this.defaultValue = value
	}

	/**
	 * @public
	 */
	addValues(...newValues: (TLNamedColorStyle | string)[]) {
		for (const v of newValues) {
			if (!this.values.includes(v as TLNamedColorStyle)) {
				this.values.push(v as TLNamedColorStyle)
			}
			validNamedColors.add(v)
		}
	}

	/**
	 * @public
	 */
	removeValues(...valuesToRemove: string[]) {
		for (const v of valuesToRemove) {
			const idx = this.values.indexOf(v as TLNamedColorStyle)
			if (idx >= 0) {
				this.values.splice(idx, 1)
			}
			validNamedColors.delete(v)
		}
	}
}

/**
 * @public
 */
export const DefaultColorStyle = new ColorStyleProp('tldraw:color', 'black')

/**
 * Same values and runtime registration as {@link DefaultColorStyle}; separate `id` for the label field.
 *
 * @public
 */
export const DefaultLabelColorStyle = (() => {
	const p = new ColorStyleProp('tldraw:labelColor', 'black')
	// Reuse the single source of named-color list
	p.addValues = (...newValues: (TLNamedColorStyle | string)[]) => {
		DefaultColorStyle.addValues(...newValues)
	}
	p.removeValues = (...valuesToRemove: string[]) => {
		DefaultColorStyle.removeValues(...valuesToRemove)
	}
	Object.defineProperty(p, 'values', { get: () => DefaultColorStyle.values })
	return p
})() as ColorStyleProp

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
	const colorNames = new Set<TLNamedColorStyle>()
	for (const def of Object.values(definitions)) {
		for (const colorPalette of [def.colors.light, def.colors.dark]) {
			for (const [key, value] of Object.entries(colorPalette)) {
				if (typeof value === 'object' && value !== null) {
					colorNames.add(key as TLNamedColorStyle)
				}
			}
		}
	}
	if (colorNames.size > 0) {
		DefaultColorStyle.addValues(...colorNames)
	}

	const toRemove = DefaultColorStyle.values.filter((v) => !colorNames.has(v as TLNamedColorStyle))
	if (toRemove.length > 0) {
		DefaultColorStyle.removeValues(...toRemove)
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
