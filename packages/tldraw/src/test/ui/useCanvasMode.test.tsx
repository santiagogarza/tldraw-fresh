import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useCanvasMode } from '../../lib/ui/components/ModeSwitcher/useCanvasMode'

const CANVAS_MODE_STORAGE_KEY = 'tldraw-canvas-mode'

function CanvasModeHarness() {
	const { canvasModeId, setCanvasMode } = useCanvasMode()

	return (
		<div>
			<div data-testid="canvas-mode-id">{canvasModeId}</div>
			<button data-testid="set-dark-mode" onClick={() => setCanvasMode('dark')}>
				Set dark mode
			</button>
		</div>
	)
}

beforeEach(() => {
	window.localStorage.removeItem(CANVAS_MODE_STORAGE_KEY)
})

afterEach(() => {
	window.localStorage.removeItem(CANVAS_MODE_STORAGE_KEY)
})

it('uses light mode by default', async () => {
	render(<CanvasModeHarness />)

	await waitFor(() => {
		expect(screen.getByTestId('canvas-mode-id').textContent).toBe('light')
	})
})

it('updates the state and localStorage when setting a mode', async () => {
	render(<CanvasModeHarness />)

	fireEvent.click(screen.getByTestId('set-dark-mode'))

	await waitFor(() => {
		expect(screen.getByTestId('canvas-mode-id').textContent).toBe('dark')
		expect(window.localStorage.getItem(CANVAS_MODE_STORAGE_KEY)).toBe('"dark"')
	})
})

it('falls back to light mode for invalid persisted values', async () => {
	window.localStorage.setItem(CANVAS_MODE_STORAGE_KEY, JSON.stringify('unknown-mode'))

	render(<CanvasModeHarness />)

	await waitFor(() => {
		expect(screen.getByTestId('canvas-mode-id').textContent).toBe('light')
	})
})
