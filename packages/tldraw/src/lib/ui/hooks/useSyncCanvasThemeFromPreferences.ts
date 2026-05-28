import { useEditor } from '@tldraw/editor'
import { useQuickReactor } from '@tldraw/state-react'
import { resolveCanvasThemeId } from './resolveCanvasThemeId'

/** Keep the editor theme in sync with persisted `themeId` user preferences. */
export function useSyncCanvasThemeFromPreferences() {
	const editor = useEditor()

	useQuickReactor(
		'useSyncCanvasThemeFromPreferences',
		() => {
			const prefs = editor.user.getUserPreferences()
			const themeIds = Object.keys(editor.getThemes())
			const nextId = resolveCanvasThemeId(prefs.themeId, themeIds)
			if (editor.getCurrentThemeId() !== nextId) {
				editor.setCurrentTheme(nextId)
			}
		},
		[editor]
	)
}
