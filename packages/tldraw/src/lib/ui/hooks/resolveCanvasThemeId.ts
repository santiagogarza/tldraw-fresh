import { TLThemeId } from '@tldraw/editor'

/**
 * Resolve a persisted theme id against the editor's registered themes.
 * Unknown, null, and empty values fall back to `default`.
 *
 * @internal
 */
export function resolveCanvasThemeId(
	themeId: string | null | undefined,
	themeIds: readonly string[]
): TLThemeId {
	if (themeId && themeIds.includes(themeId)) {
		return themeId as TLThemeId
	}
	return 'default'
}
