import type { Editor } from 'tldraw'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { CANVAS_THEMES } from './canvas-theme-modes'
import { applyCanvasThemeMode } from './useCanvasThemeMode'

type ColorScheme = 'light' | 'dark' | 'system'

function createMockEditor(options?: {
	colorScheme?: ColorScheme
	colorMode?: 'light' | 'dark'
	themes?: Record<string, unknown>
}) {
	const container = document.createElement('div')
	const prefs = { colorScheme: options?.colorScheme ?? ('system' as ColorScheme) }
	const themes = { default: {}, ...CANVAS_THEMES, ...options?.themes }

	const editor = {
		getContainer: () => container,
		user: {
			getUserPreferences: () => prefs,
			updateUserPreferences: vi.fn((update: Partial<typeof prefs>) => {
				Object.assign(prefs, update)
			}),
		},
		getThemes: () => themes,
		setCurrentTheme: vi.fn(),
		getColorMode: vi.fn(() => options?.colorMode ?? 'light'),
	}

	return { editor: editor as unknown as Editor, container, prefs }
}

describe('applyCanvasThemeMode', () => {
	beforeEach(() => {
		document.documentElement.style.cssText = ''
	})

	it('forces light colorScheme for light mode', () => {
		const { editor, prefs } = createMockEditor({ colorScheme: 'dark' })

		applyCanvasThemeMode(editor, 'light')

		expect(prefs.colorScheme).toBe('light')
		expect(editor.user.updateUserPreferences).toHaveBeenCalledWith({ colorScheme: 'light' })
	})

	it('forces dark colorScheme for dark mode', () => {
		const { editor, prefs } = createMockEditor({ colorScheme: 'system' })

		applyCanvasThemeMode(editor, 'dark')

		expect(prefs.colorScheme).toBe('dark')
	})

	it('resets pinned colorScheme to system for gradient modes', () => {
		const { editor, prefs } = createMockEditor({ colorScheme: 'dark' })

		applyCanvasThemeMode(editor, 'sky')

		expect(prefs.colorScheme).toBe('system')
		expect(editor.user.updateUserPreferences).toHaveBeenCalledWith({ colorScheme: 'system' })
	})

	it('leaves system colorScheme unchanged for gradient modes', () => {
		const { editor, prefs } = createMockEditor({ colorScheme: 'system' })

		applyCanvasThemeMode(editor, 'sunrise')

		expect(prefs.colorScheme).toBe('system')
		expect(editor.user.updateUserPreferences).not.toHaveBeenCalled()
	})

	it('sets the registered custom theme for sky mode', () => {
		const { editor } = createMockEditor()

		applyCanvasThemeMode(editor, 'sky')

		expect(editor.setCurrentTheme).toHaveBeenCalledWith('sky')
	})

	it('falls back to default theme for light and dark modes', () => {
		const { editor } = createMockEditor()

		applyCanvasThemeMode(editor, 'light')
		expect(editor.setCurrentTheme).toHaveBeenCalledWith('default')

		vi.mocked(editor.setCurrentTheme).mockClear()
		applyCanvasThemeMode(editor, 'dark')
		expect(editor.setCurrentTheme).toHaveBeenCalledWith('default')
	})

	it('applies css overrides for the current color mode', () => {
		const { editor, container } = createMockEditor({ colorMode: 'light' })

		applyCanvasThemeMode(editor, 'sky')

		expect(container.style.getPropertyValue('--tl-color-primary')).toBe('#3b8fd9')
		expect(container.dataset.canvasThemeMode).toBe('sky')
	})

	it('clears previous css overrides when switching to a mode without overrides', () => {
		const { editor, container } = createMockEditor({ colorMode: 'light' })

		applyCanvasThemeMode(editor, 'sky')
		expect(container.style.getPropertyValue('--tl-color-primary')).toBe('#3b8fd9')

		applyCanvasThemeMode(editor, 'light')
		expect(container.style.getPropertyValue('--tl-color-primary')).toBe('')
		expect(container.dataset.canvasThemeMode).toBe('light')
	})

	it('applies dark overrides when color mode is dark', () => {
		const { editor, container } = createMockEditor({ colorMode: 'dark' })

		applyCanvasThemeMode(editor, 'sunset')

		expect(container.style.getPropertyValue('--tl-color-primary')).toBe('#f07858')
	})
})
