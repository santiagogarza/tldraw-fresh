import { type TLDefaultColorStyle, isCustomColorStyle } from '@tldraw/editor'
import { useCallback, useEffect, useState } from 'react'

const STORAGE = 'tldraw_recent_shape_colors'
const MAX = 4

function keyForUser(userId: string) {
	return `${STORAGE}:${userId}`
}

function normalizeColor(c: TLDefaultColorStyle): string {
	return isCustomColorStyle(c) ? c.value : c
}

/**
 * Deduplicate while preserving recency: most recent first.
 * @public
 */
export function dedupeRecentColors(colors: readonly TLDefaultColorStyle[]): TLDefaultColorStyle[] {
	const seen = new Set<string>()
	const out: TLDefaultColorStyle[] = []
	for (const c of colors) {
		const k = normalizeColor(c)
		if (seen.has(k)) continue
		seen.add(k)
		out.push(c)
	}
	return out.slice(0, MAX)
}

/**
 * @public
 */
export function loadRecentShapeColors(userId: string): TLDefaultColorStyle[] {
	if (typeof localStorage === 'undefined') return []
	try {
		const raw = localStorage.getItem(keyForUser(userId))
		if (!raw) return []
		const parsed = JSON.parse(raw) as unknown
		if (!Array.isArray(parsed)) return []
		const out: TLDefaultColorStyle[] = []
		for (const item of parsed) {
			if (typeof item === 'string') {
				out.push(item as TLDefaultColorStyle)
			} else if (
				item &&
				typeof item === 'object' &&
				(item as { type?: string }).type === 'custom' &&
				typeof (item as { value?: string }).value === 'string'
			) {
				const v = (item as { value: string }).value
				if (/^#[0-9a-f]{6}$/i.test(v)) {
					out.push({ type: 'custom', value: v.toLowerCase() } as const)
				}
			}
		}
		return dedupeRecentColors(out)
	} catch {
		return []
	}
}

function saveRecent(userId: string, colors: TLDefaultColorStyle[]) {
	try {
		localStorage.setItem(keyForUser(userId), JSON.stringify(colors))
	} catch {
		// ignore quota
	}
}

/**
 * @public
 */
export function useRecentShapeColors(userId: string) {
	const [list, setList] = useState<TLDefaultColorStyle[]>(() => loadRecentShapeColors(userId))

	const setFromStorage = useCallback((uid: string) => {
		setList(loadRecentShapeColors(uid))
	}, [])

	useEffect(() => {
		setList(loadRecentShapeColors(userId))
	}, [userId])

	const push = useCallback(
		(used: TLDefaultColorStyle) => {
			const k = normalizeColor(used)
			const prev = loadRecentShapeColors(userId)
			const next = dedupeRecentColors([used, ...prev.filter((c) => normalizeColor(c) !== k)])
			saveRecent(userId, next)
			setList(next)
		},
		[userId]
	)

	return { recentColors: list, pushRecent: push, reloadFromStorage: setFromStorage }
}
