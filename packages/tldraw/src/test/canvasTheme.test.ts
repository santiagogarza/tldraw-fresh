import {
	TLTheme,
	TLUserPreferences,
	atom,
	createTLCurrentUser,
	defaultUserPreferences,
	resolveThemes,
	userTypeValidator,
} from '@tldraw/editor'
import { structuredClone } from '@tldraw/utils'
import { describe, expect, it } from 'vitest'
import {
	getActiveCanvasThemeMode,
	getCanvasThemePreferenceUpdate,
} from '../lib/ui/components/CanvasThemePicker/canvasThemePickerUtils'
import { resolveCanvasThemeId } from '../lib/ui/hooks/resolveCanvasThemeId'
import { TestEditor } from './TestEditor'

describe('canvas theme integration', () => {
	it('includes built-in themes on a default TestEditor', () => {
		const editor = new TestEditor()
		expect(Object.keys(editor.getThemes()).sort()).toEqual(
			['default', 'sky', 'sunrise', 'sunset'].sort()
		)
		editor.dispose()
	})

	it('applies initialTheme from editor options', () => {
		const editor = new TestEditor({ initialTheme: 'sunset' })
		expect(editor.getCurrentThemeId()).toBe('sunset')
		expect(editor.getCurrentTheme().colors.light.backgroundGradient).toBeDefined()
		editor.dispose()
	})

	it('persists themeId through user preferences and resolves on read', () => {
		const editor = new TestEditor()
		editor.user.updateUserPreferences({ themeId: 'sunrise' })
		expect(editor.user.getThemeId()).toBe('sunrise')

		const resolved = resolveCanvasThemeId(
			editor.user.getUserPreferences().themeId,
			Object.keys(editor.getThemes())
		)
		expect(resolved).toBe('sunrise')
		editor.dispose()
	})

	it('falls back to default when persisted themeId is unknown', () => {
		const editor = new TestEditor()
		editor.user.updateUserPreferences({ themeId: 'deleted-theme' })
		editor.setCurrentTheme('sky')

		const resolved = resolveCanvasThemeId(
			editor.user.getUserPreferences().themeId,
			Object.keys(editor.getThemes())
		)
		expect(resolved).toBe('default')

		// Simulating sync hook behavior
		if (editor.getCurrentThemeId() !== resolved) {
			editor.setCurrentTheme(resolved)
		}
		expect(editor.getCurrentThemeId()).toBe('default')
		editor.dispose()
	})

	it('keeps color scheme when selecting a named theme mode', () => {
		const editor = new TestEditor()
		editor.user.updateUserPreferences({ colorScheme: 'dark' })
		const { userPreferences, editorThemeId } = getCanvasThemePreferenceUpdate('sky')
		editor.user.updateUserPreferences(userPreferences)
		editor.setCurrentTheme(editorThemeId)

		expect(editor.getCurrentThemeId()).toBe('sky')
		expect(editor.user.getIsDarkMode()).toBe(true)
		expect(editor.user.getUserPreferences().colorScheme).toBe('dark')
		expect(getActiveCanvasThemeMode(editor.getCurrentThemeId(), editor.user.getIsDarkMode())).toBe(
			'sky'
		)
		editor.dispose()
	})

	it('resets to default theme when picking light or dark from the picker model', () => {
		const editor = new TestEditor({ initialTheme: 'sunrise' })
		const light = getCanvasThemePreferenceUpdate('light')
		editor.user.updateUserPreferences(light.userPreferences)
		editor.setCurrentTheme(light.editorThemeId)

		expect(editor.getCurrentThemeId()).toBe('default')
		expect(editor.user.getIsDarkMode()).toBe(false)
		expect(getActiveCanvasThemeMode(editor.getCurrentThemeId(), editor.user.getIsDarkMode())).toBe(
			'light'
		)

		const dark = getCanvasThemePreferenceUpdate('dark')
		editor.user.updateUserPreferences(dark.userPreferences)
		editor.setCurrentTheme(dark.editorThemeId)
		expect(editor.getCurrentThemeId()).toBe('default')
		expect(editor.user.getIsDarkMode()).toBe(true)
		editor.dispose()
	})

	it('uses gradient background colors in sunrise dark mode', () => {
		const editor = new TestEditor({ initialTheme: 'sunrise', colorScheme: 'dark' })
		const colors = editor.getCurrentTheme().colors[editor.getColorMode()]
		expect(colors.backgroundGradient).toBe('linear-gradient(135deg, #4a1942 0%, #2e1065 100%)')
		expect(colors.background).toBe('#3b1730')
		editor.dispose()
	})

	it('accepts themeId in user preference validation', () => {
		expect(
			userTypeValidator.validate({
				id: 'user-1',
				themeId: 'sunrise',
			})
		).toMatchObject({ themeId: 'sunrise' })

		expect(
			userTypeValidator.validate({
				id: 'user-1',
				themeId: null,
			})
		).toMatchObject({ themeId: null })
	})

	it('rejects invalid themeId types in user preference validation', () => {
		expect(() =>
			userTypeValidator.validate({
				id: 'user-1',
				themeId: 42,
			} as any)
		).toThrow()
	})

	it('uses default themeId when preference is omitted on a custom user', () => {
		const userPreferences = atom<TLUserPreferences>('userPreferences', {
			id: '123',
			colorScheme: 'light',
		})
		const editor = new TestEditor({
			user: createTLCurrentUser({
				userPreferences,
				setUserPreferences: (prefs) => userPreferences.set(prefs),
			}),
		})

		expect(editor.user.getThemeId()).toBe(defaultUserPreferences.themeId)
		editor.dispose()
	})

	it('allows custom themes to override built-in sky', () => {
		const customSky: TLTheme = structuredClone(resolveThemes().sky)
		customSky.colors.light.background = '#112233'

		const editor = new TestEditor({
			themes: resolveThemes({ sky: customSky }),
			initialTheme: 'sky',
		})
		expect(editor.getCurrentTheme().colors.light.background).toBe('#112233')
		editor.dispose()
	})
})
