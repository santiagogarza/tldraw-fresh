import { useContainer, useEditor, useValue } from '@tldraw/editor'
import { useEffect, useLayoutEffect } from 'react'
import {
	CANVAS_THEME_CSS_VAR_KEYS,
	CanvasThemeDefinition,
	getCanvasThemeDefinition,
} from './canvasThemeDefinitions'
import { getCanvasThemeAtom, setCanvasTheme } from './canvasThemeState'

function applyThemeToContainer(container: HTMLElement, def: CanvasThemeDefinition) {
	for (const [key, value] of Object.entries(def.cssVariables)) {
		container.style.setProperty(`--${key}`, value)
	}
	if (def.backgroundImage) {
		container.style.setProperty('--tl-color-background-image', def.backgroundImage)
	}
}

function clearThemeFromContainer(container: HTMLElement) {
	for (const key of CANVAS_THEME_CSS_VAR_KEYS) {
		container.style.removeProperty(`--${key}`)
	}
}

function resolveColorScheme(
	colorScheme: 'light' | 'dark' | 'system' | undefined,
	isDarkMode: boolean
): 'light' | 'dark' {
	if (colorScheme === 'dark') return 'dark'
	if (colorScheme === 'light') return 'light'
	return isDarkMode ? 'dark' : 'light'
}

/** @public */
export function useCanvasTheme() {
	const editor = useEditor()
	const container = useContainer()
	const canvasThemeAtom = getCanvasThemeAtom()
	const themeId = useValue('canvasTheme', () => canvasThemeAtom.get(), [canvasThemeAtom])

	const colorSchemePref = useValue(
		'colorScheme',
		() => editor.user.getUserPreferences().colorScheme,
		[editor]
	)
	const isDarkMode = useValue('isDarkMode', () => editor.user.getIsDarkMode(), [editor])

	useLayoutEffect(() => {
		const def = getCanvasThemeDefinition(themeId)
		applyThemeToContainer(container, def)
		return () => clearThemeFromContainer(container)
	}, [container, themeId])

	useLayoutEffect(() => {
		const def = getCanvasThemeDefinition(themeId)
		const targetScheme = themeId === 'light' || themeId === 'dark' ? themeId : def.baseColorMode
		const current = editor.user.getUserPreferences().colorScheme
		if (current !== targetScheme) {
			editor.user.updateUserPreferences({ colorScheme: targetScheme })
		}
	}, [editor, themeId])

	useEffect(() => {
		const resolved = resolveColorScheme(colorSchemePref, isDarkMode)
		const current = canvasThemeAtom.get()
		const def = getCanvasThemeDefinition(current)

		if (current !== 'light' && current !== 'dark' && resolved !== def.baseColorMode) {
			setCanvasTheme(resolved)
			return
		}

		if ((current === 'light' || current === 'dark') && current !== resolved) {
			setCanvasTheme(resolved)
		}
	}, [canvasThemeAtom, colorSchemePref, isDarkMode])
}
