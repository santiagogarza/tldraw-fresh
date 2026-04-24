import { T, Validator } from '@tldraw/validate'

const HEX6 = /^#[0-9A-Fa-f]{6}$/

const customFields = T.object({
	type: T.literal('custom' as const),
	value: T.string,
})

/**
 * @public
 */
export type TLCustomColorStyle = {
	type: 'custom'
	/** CSS hex color `#rrggbb` (normalized to lowercase) */
	value: string
}

const validateCustomColor: (v: unknown) => TLCustomColorStyle = (value) => {
	const o = customFields.validate(value) as { type: 'custom'; value: string }
	if (typeof o.value !== 'string' || !HEX6.test(o.value)) {
		throw new T.ValidationError('Expected #RRGGBB hex value for custom color')
	}
	const low = o.value.toLowerCase()
	if (low !== o.value) {
		;(o as { value: string }).value = low
	}
	return o as TLCustomColorStyle
}

const validateCustomColorKnown = (known: TLCustomColorStyle, next: unknown) => {
	if (Object.is(known, next)) return known
	return validateCustomColor(next)
}

/**
 * @public
 */
export const customColorStyleValidator: Validator<TLCustomColorStyle> = new Validator(
	validateCustomColor,
	validateCustomColorKnown
)

/**
 * @public
 */
export function isCustomColorStyle(value: unknown): value is TLCustomColorStyle {
	if (typeof value !== 'object' || value === null) return false
	return (value as { type?: string }).type === 'custom'
}
