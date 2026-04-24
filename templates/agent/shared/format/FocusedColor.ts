import { isCustomColorStyle, type TLDefaultColorStyle, type TLNamedColorStyle } from 'tldraw'
import z from 'zod'

const FOCUSED_NAMED = [
	'red',
	'light-red',
	'green',
	'light-green',
	'blue',
	'light-blue',
	'orange',
	'yellow',
	'black',
	'violet',
	'light-violet',
	'grey',
	'white',
] as const

export const FocusedColor = z.union([z.enum(FOCUSED_NAMED), z.string().regex(/^#[0-9a-fA-F]{6}$/)])

export type IFocusedColor = z.infer<typeof FocusedColor>

export function tldrawColorToFocused(c: TLDefaultColorStyle): IFocusedColor {
	if (isCustomColorStyle(c) && c.value) {
		return c.value as IFocusedColor
	}
	return asColor(c as string)
}

/**
 * For shape props: wire format (named or `#rrggbb`) with optional tldraw default.
 */
export function focusedColorToTldraw(
	focused: IFocusedColor | undefined,
	fallback: TLDefaultColorStyle | undefined
): TLDefaultColorStyle {
	if (focused !== undefined) {
		if (typeof focused === 'string' && /^#[0-9A-Fa-f]{6}$/.test(focused)) {
			return { type: 'custom', value: focused.toLowerCase() } as const
		}
		return focused as TLNamedColorStyle
	}
	if (fallback !== undefined) return fallback
	return 'black'
}

export function asColor(color: string): IFocusedColor {
	if (FocusedColor.safeParse(color).success) {
		return color as IFocusedColor
	}
	if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
		return color.toLowerCase() as IFocusedColor
	}
	switch (color) {
		case 'pink': {
			return 'light-violet'
		}
		case 'light-pink': {
			return 'light-violet'
		}
	}

	return 'black'
}
