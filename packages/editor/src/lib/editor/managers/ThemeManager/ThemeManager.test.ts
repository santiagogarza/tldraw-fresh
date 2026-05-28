import { TLTheme } from '@tldraw/tlschema'
import { structuredClone } from '@tldraw/utils'
import { describe, expect, it, vi } from 'vitest'
import { createTLStore } from '../../../config/createTLStore'
import { Editor } from '../../Editor'
import { DEFAULT_THEME } from './defaultThemes'
import { resolveThemes } from './ThemeManager'

function createTestEditor(themes = resolveThemes()) {
	const shapeUtils: never[] = []
	return new Editor({
		shapeUtils,
		bindingUtils: [],
		tools: [],
		store: createTLStore({ shapeUtils, bindingUtils: [] }),
		getContainer: () => document.body,
		themes,
		initialTheme: 'default',
	})
}

describe('ThemeManager', () => {
	it('registers built-in sky, sunrise, and sunset themes via resolveThemes', () => {
		const editor = createTestEditor()
		expect(editor.getThemes()).toMatchObject({
			default: expect.objectContaining({ id: 'default' }),
			sky: expect.objectContaining({ id: 'sky' }),
			sunrise: expect.objectContaining({ id: 'sunrise' }),
			sunset: expect.objectContaining({ id: 'sunset' }),
		})
		editor.dispose()
	})

	it('switches canvas colors when setCurrentTheme changes', () => {
		const editor = createTestEditor()
		editor.setCurrentTheme('sky')
		expect(editor.getCurrentThemeId()).toBe('sky')
		expect(editor.getCurrentTheme().colors.light.background).toBe('#dbeafe')

		editor.setCurrentTheme('sunrise')
		expect(editor.getCurrentTheme().colors.light.backgroundGradient).toBeDefined()
		editor.dispose()
	})

	it('falls back to default when the current theme is removed from the registry', () => {
		const editor = createTestEditor()
		editor.setCurrentTheme('sky')
		expect(editor.getCurrentThemeId()).toBe('sky')

		editor.updateThemes((themes) => {
			const next = structuredClone(themes)
			delete (next as { sky?: TLTheme }).sky
			return next
		})

		expect(editor.getCurrentThemeId()).toBe('default')
		editor.dispose()
	})

	it('warns in development when setting an unknown theme id but still stores it', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const editor = createTestEditor()

		editor.setCurrentTheme('not-a-real-theme' as 'default')
		expect(editor.getCurrentThemeId()).toBe('not-a-real-theme')
		expect(warn).toHaveBeenCalled()

		warn.mockRestore()
		editor.dispose()
	})

	it('allows consumer themes to override built-in ids', () => {
		const customSky: TLTheme = structuredClone(DEFAULT_THEME)
		customSky.id = 'sky'
		customSky.colors.light.background = '#abcdef'

		const editor = createTestEditor(resolveThemes({ sky: customSky }))
		expect(editor.getTheme('sky')?.colors.light.background).toBe('#abcdef')
		editor.dispose()
	})
})
