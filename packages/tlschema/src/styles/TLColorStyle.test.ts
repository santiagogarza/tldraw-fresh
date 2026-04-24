import { describe, expect, it } from 'vitest'
import {
	DefaultColorStyle,
	HEX_COLOR_REGEX,
	isHexColor,
	normalizeHexColor,
} from './TLColorStyle'

describe('hex color helpers', () => {
	it('matches 3-, 6-, and 8-character hex strings', () => {
		expect(HEX_COLOR_REGEX.test('#abc')).toBe(true)
		expect(HEX_COLOR_REGEX.test('#ABCDEF')).toBe(true)
		expect(HEX_COLOR_REGEX.test('#12345678')).toBe(true)
	})

	it('rejects non-hex strings', () => {
		expect(HEX_COLOR_REGEX.test('red')).toBe(false)
		expect(HEX_COLOR_REGEX.test('#zzz')).toBe(false)
		expect(HEX_COLOR_REGEX.test('#ff')).toBe(false)
		expect(HEX_COLOR_REGEX.test('ff00aa')).toBe(false)
	})

	it('isHexColor narrows types and rejects non-strings', () => {
		expect(isHexColor('#ff00aa')).toBe(true)
		expect(isHexColor(123)).toBe(false)
		expect(isHexColor(null)).toBe(false)
	})

	it('normalizeHexColor expands short form and lowercases', () => {
		expect(normalizeHexColor('#ABC')).toBe('#aabbcc')
		expect(normalizeHexColor('#FF00AA')).toBe('#ff00aa')
		expect(normalizeHexColor('#ff00aa')).toBe('#ff00aa')
		expect(normalizeHexColor('not-a-color')).toBe('not-a-color')
	})
})

describe('DefaultColorStyle validation', () => {
	it('accepts named preset colors', () => {
		expect(DefaultColorStyle.validate('black')).toBe('black')
		expect(DefaultColorStyle.validate('red')).toBe('red')
		expect(DefaultColorStyle.validate('light-violet')).toBe('light-violet')
	})

	it('accepts hex colors and normalizes them', () => {
		expect(DefaultColorStyle.validate('#ff00aa')).toBe('#ff00aa')
		expect(DefaultColorStyle.validate('#FF00AA')).toBe('#ff00aa')
		expect(DefaultColorStyle.validate('#f0a')).toBe('#ff00aa')
	})

	it('rejects invalid hex strings', () => {
		expect(() => DefaultColorStyle.validate('#zzz')).toThrow()
		expect(() => DefaultColorStyle.validate('not-a-color')).toThrow()
		expect(() => DefaultColorStyle.validate('#gggggg')).toThrow()
	})

	it('rejects non-string values', () => {
		expect(() => DefaultColorStyle.validate(123)).toThrow()
		expect(() => DefaultColorStyle.validate(null)).toThrow()
		expect(() => DefaultColorStyle.validate(undefined)).toThrow()
	})
})
