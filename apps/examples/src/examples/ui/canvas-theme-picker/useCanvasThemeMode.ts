import { react } from '@tldraw/state'
import { useCallback, useEffect, useState } from 'react'
import { Editor, useContainer, useEditor } from 'tldraw'
import {
	CANVAS_THEME_DEFINITIONS,
	CanvasThemeMode,
	getAllCanvasThemeOverrideKeys,
	getCssOverridesForMode,
	readStoredCanvasThemeMode,
	writeStoredCanvasThemeMode,
} from './canvas-theme-modes'

const OVERRIDE_KEYS = getAllCanvasThemeOverrideKeys()

function applyCssOverrides(container: HTMLElement, overrides: Record<string, string>) {
	for (const [key, value] of Object.entries(overrides)) {
		container.style.setProperty(`--${key}`, value)
	}
}

function clearCssOverrides(container: HTMLElement) {
	for (const key of OVERRIDE_KEYS) {
		container.style.removeProperty(`--${key}`)
	}
}

export function applyCanvasThemeMode(editor: Editor, mode: CanvasThemeMode) {
	const definition = CANVAS_THEME_DEFINITIONS[mode]
	const container = editor.getContainer()

	if (definition.colorScheme) {
		editor.user.updateUserPreferences({ colorScheme: definition.colorScheme })
	} else {
		const prefs = editor.user.getUserPreferences()
		if (prefs.colorScheme === 'light' || prefs.colorScheme === 'dark') {
			editor.user.updateUserPreferences({ colorScheme: 'system' })
		}
	}

	const themes = editor.getThemes()
	if (definition.themeId in themes) {
		editor.setCurrentTheme(definition.themeId)
	} else if (mode === 'light' || mode === 'dark') {
		editor.setCurrentTheme('default')
	}

	const colorMode = editor.getColorMode()
	clearCssOverrides(container)
	applyCssOverrides(container, getCssOverridesForMode(definition, colorMode))

	container.dataset.canvasThemeMode = mode
}

export function useCanvasThemeMode() {
	const editor = useEditor()
	const container = useContainer()
	const [mode, setModeState] = useState<CanvasThemeMode>(() => readStoredCanvasThemeMode())

	const setMode = useCallback(
		(next: CanvasThemeMode) => {
			setModeState(next)
			writeStoredCanvasThemeMode(next)
			applyCanvasThemeMode(editor, next)
		},
		[editor]
	)

	useEffect(() => {
		applyCanvasThemeMode(editor, mode)
	}, [editor, mode])

	// Re-apply CSS overrides when color mode changes (system preference or light/dark modes).
	useEffect(() => {
		return react('canvas theme color mode', () => {
			const definition = CANVAS_THEME_DEFINITIONS[mode]
			editor.getColorMode()
			clearCssOverrides(container)
			applyCssOverrides(container, getCssOverridesForMode(definition, editor.getColorMode()))
		})
	}, [container, editor, mode])

	return { mode, setMode, definition: CANVAS_THEME_DEFINITIONS[mode] }
}
