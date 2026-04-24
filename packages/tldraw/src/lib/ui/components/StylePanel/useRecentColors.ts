import { isHexColor, normalizeHexColor } from '@tldraw/editor'
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'tldraw.recentColors'
const MAX_RECENT = 4

function readFromStorage(): string[] {
	if (typeof window === 'undefined') return []
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		if (!Array.isArray(parsed)) return []
		return parsed
			.filter((v): v is string => typeof v === 'string')
			.slice(0, MAX_RECENT)
	} catch {
		return []
	}
}

function writeToStorage(values: string[]) {
	if (typeof window === 'undefined') return
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values.slice(0, MAX_RECENT)))
	} catch {
		// ignore quota / access errors
	}
}

const subscribers = new Set<() => void>()
let cache: string[] | null = null

function getCurrent(): string[] {
	if (cache === null) cache = readFromStorage()
	return cache
}

function setCurrent(next: string[]) {
	cache = next.slice(0, MAX_RECENT)
	writeToStorage(cache)
	subscribers.forEach((fn) => fn())
}

/**
 * Hook for reading and updating the list of "recent" colors used in the style panel. Values
 * are deduplicated (most recent wins) and capped to 4 entries. Persisted to `localStorage`
 * so recency survives page reloads.
 *
 * @public
 */
export function useRecentColors(): {
	recent: string[]
	push(color: string): void
} {
	const [recent, setRecent] = useState<string[]>(() => getCurrent())

	useEffect(() => {
		const handler = () => setRecent(getCurrent())
		subscribers.add(handler)
		return () => {
			subscribers.delete(handler)
		}
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') return
		const onStorage = (e: StorageEvent) => {
			if (e.key && e.key !== STORAGE_KEY) return
			cache = null
			setRecent(getCurrent())
			subscribers.forEach((fn) => fn())
		}
		window.addEventListener('storage', onStorage)
		return () => window.removeEventListener('storage', onStorage)
	}, [])

	const push = useCallback((color: string) => {
		if (typeof color !== 'string') return
		const normalized = isHexColor(color) ? normalizeHexColor(color) : color
		const current = getCurrent()
		const filtered = current.filter((c) => c !== normalized)
		setCurrent([normalized, ...filtered])
	}, [])

	return { recent, push }
}
