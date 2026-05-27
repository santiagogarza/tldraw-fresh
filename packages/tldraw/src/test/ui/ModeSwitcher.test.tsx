import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Tldraw } from '../../lib/Tldraw'
import { DefaultModeSwitcher } from '../../lib/ui/components/ModeSwitcher/DefaultModeSwitcher'
import {
	CANVAS_MODES,
	DEFAULT_CANVAS_MODE_ID,
	getCanvasMode,
	isCanvasModeId,
} from '../../lib/ui/components/ModeSwitcher/modes'
import {
	CANVAS_MODE_STORAGE_KEY,
	useCanvasMode,
} from '../../lib/ui/components/ModeSwitcher/useCanvasMode'
import { renderTldrawComponent } from '../testutils/renderTldrawComponent'

function renderHook<T>(useHook: () => T) {
	const result: { current: T } = { current: undefined as unknown as T }
	function HookWrapper() {
		result.current = useHook()
		return null
	}
	return { result, HookWrapper }
}

beforeEach(() => {
	window.localStorage.clear()
})

afterEach(() => {
	window.localStorage.clear()
})

describe('useCanvasMode', () => {
	it("reads default 'light' mode when nothing is stored", async () => {
		const { result, HookWrapper } = renderHook(() => useCanvasMode())
		const { unmount } = render(<HookWrapper />)
		expect(result.current[0].id).toBe(DEFAULT_CANVAS_MODE_ID)
		expect(result.current[0].id).toBe('light')
		unmount()
	})

	it('setCanvasMode updates the value and persists it to localStorage', async () => {
		const { result, HookWrapper } = renderHook(() => useCanvasMode())
		const { unmount } = render(<HookWrapper />)
		await act(async () => {
			result.current[1]('sunset')
		})
		expect(result.current[0].id).toBe('sunset')
		expect(window.localStorage.getItem(CANVAS_MODE_STORAGE_KEY)).toBe(JSON.stringify('sunset'))
		unmount()
	})

	it("falls back to 'light' when localStorage holds an invalid value", async () => {
		window.localStorage.setItem(CANVAS_MODE_STORAGE_KEY, JSON.stringify('not-a-real-mode'))
		const { result, HookWrapper } = renderHook(() => useCanvasMode())
		const { unmount } = render(<HookWrapper />)
		expect(result.current[0].id).toBe('light')
		unmount()
	})

	it('restores a persisted mode on remount', async () => {
		window.localStorage.setItem(CANVAS_MODE_STORAGE_KEY, JSON.stringify('sky'))
		const { result, HookWrapper } = renderHook(() => useCanvasMode())
		const { unmount } = render(<HookWrapper />)
		await waitFor(() => {
			expect(result.current[0].id).toBe('sky')
		})
		unmount()
	})
})

describe('canvas mode helpers', () => {
	it('CANVAS_MODES contains five distinct modes in the documented order', () => {
		expect(CANVAS_MODES.map((m) => m.id)).toEqual(['light', 'dark', 'sky', 'sunrise', 'sunset'])
		expect(new Set(CANVAS_MODES.map((m) => m.id)).size).toBe(5)
	})

	it('getCanvasMode returns the descriptor for a known id and falls back to light otherwise', () => {
		expect(getCanvasMode('dark').id).toBe('dark')
		expect(getCanvasMode('sky').id).toBe('sky')
		expect(getCanvasMode('not-real' as any).id).toBe('light')
	})

	it('isCanvasModeId accepts only known ids', () => {
		for (const m of CANVAS_MODES) {
			expect(isCanvasModeId(m.id)).toBe(true)
		}
		expect(isCanvasModeId('rainbow')).toBe(false)
		expect(isCanvasModeId(null)).toBe(false)
		expect(isCanvasModeId(undefined)).toBe(false)
	})

	it('sunrise and sunset modes use a CSS gradient as their background', () => {
		const sunrise = getCanvasMode('sunrise')
		const sunset = getCanvasMode('sunset')
		expect(sunrise.background).toMatch(/linear-gradient/)
		expect(sunset.background).toMatch(/linear-gradient/)
	})
})

describe('<DefaultModeSwitcher />', () => {
	it('renders the trigger button with the canvas-mode aria-label', async () => {
		await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })
		const trigger = await screen.findByTestId('mode-switcher.button')
		expect(trigger).toBeDefined()
		// In the test environment translation is mocked to return the key itself.
		expect(trigger.getAttribute('aria-label')).toBe('mode.menu.title')
	})

	it('marks the editor container with the default mode id on mount', async () => {
		await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })
		await screen.findByTestId('mode-switcher.button')
		const containers = document.querySelectorAll('.tl-container')
		const container = Array.from(containers).find((c) => c.hasAttribute('data-canvas-mode'))
		expect(container).toBeDefined()
		expect(container?.getAttribute('data-canvas-mode')).toBe('light')
	})

	it('opens the popover with all five mode items, then selecting one updates the trigger', async () => {
		await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })
		const trigger = await screen.findByTestId('mode-switcher.button')

		await act(async () => {
			fireEvent.click(trigger)
		})

		for (const id of ['light', 'dark', 'sky', 'sunrise', 'sunset'] as const) {
			expect(await screen.findByTestId(`mode-switcher.item.${id}`)).toBeDefined()
		}

		const sunsetItem = await screen.findByTestId('mode-switcher.item.sunset')
		await act(async () => {
			fireEvent.click(sunsetItem)
		})

		await waitFor(() => {
			const containers = document.querySelectorAll('.tl-container')
			const c = Array.from(containers).find(
				(el) => el.getAttribute('data-canvas-mode') === 'sunset'
			)
			expect(c).toBeDefined()
		})

		// And the persisted mode is 'sunset'
		expect(window.localStorage.getItem(CANVAS_MODE_STORAGE_KEY)).toBe(JSON.stringify('sunset'))
	})

	it('restores the persisted mode after a remount', async () => {
		window.localStorage.setItem(CANVAS_MODE_STORAGE_KEY, JSON.stringify('sky'))
		const { unmount } = await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })
		await screen.findByTestId('mode-switcher.button')

		await waitFor(() => {
			const containers = document.querySelectorAll('.tl-container')
			const c = Array.from(containers).find((el) => el.getAttribute('data-canvas-mode') === 'sky')
			expect(c).toBeDefined()
		})
		unmount()
	})

	it('can be hidden via components={{ ModeSwitcher: null }}', async () => {
		await renderTldrawComponent(<Tldraw components={{ ModeSwitcher: null }} />, {
			waitForPatterns: false,
		})
		expect(screen.queryByTestId('mode-switcher.button')).toBeNull()
	})

	it('renders DefaultModeSwitcher exported from the public path', () => {
		expect(typeof DefaultModeSwitcher).toBe('object') // memo NamedExoticComponent
	})
})
