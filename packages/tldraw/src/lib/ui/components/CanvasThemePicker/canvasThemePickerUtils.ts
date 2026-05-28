import { TLThemeId, TLUserPreferences } from '@tldraw/editor'

export type CanvasThemeMode = 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset'

export interface CanvasThemePreferenceUpdate {
	userPreferences: Partial<TLUserPreferences>
	editorThemeId: TLThemeId
}

/** Map the current editor theme + color mode to the picker's active mode. */
export function getActiveCanvasThemeMode(themeId: TLThemeId, isDarkMode: boolean): CanvasThemeMode {
	if (themeId === 'sky' || themeId === 'sunrise' || themeId === 'sunset') {
		return themeId
	}
	return isDarkMode ? 'dark' : 'light'
}

/** User prefs + editor theme to apply when the user picks a canvas mode. */
export function getCanvasThemePreferenceUpdate(mode: CanvasThemeMode): CanvasThemePreferenceUpdate {
	switch (mode) {
		case 'light':
			return {
				userPreferences: { colorScheme: 'light', themeId: 'default' },
				editorThemeId: 'default',
			}
		case 'dark':
			return {
				userPreferences: { colorScheme: 'dark', themeId: 'default' },
				editorThemeId: 'default',
			}
		case 'sky':
		case 'sunrise':
		case 'sunset':
			return {
				userPreferences: { themeId: mode },
				editorThemeId: mode,
			}
		default: {
			const _exhaustive: never = mode
			return _exhaustive
		}
	}
}
