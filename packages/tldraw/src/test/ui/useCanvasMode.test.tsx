import { act, screen, waitFor } from '@testing-library/react'
import { Tldraw } from '../../lib/Tldraw'
import { applyCanvasModeStyles } from '../../lib/ui/components/ModeSwitcher/applyCanvasModeStyles'
import {
	CANVAS_MODE_STORAGE_KEY,
	getCanvasModeById,
} from '../../lib/ui/components/ModeSwitcher/modes'
import { useCanvasMode } from '../../lib/ui/components/ModeSwitcher/useCanvasMode'
import { renderTldrawComponentWithEditor } from '../testutils/renderTldrawComponent'

function CanvasModeProbe() {
	const { canvasModeId, setCanvasMode, getCanvasMode } = useCanvasMode()
	return (
		<div>
			<div data-testid="canvas-mode-id">{canvasModeId}</div>
			<div data-testid="canvas-mode-label">{getCanvasMode().id}</div>
			<button type="button" data-testid="set-dark" onClick={() => setCanvasMode('dark')}>
				Set dark
			</button>
		</div>
	)
}

describe('applyCanvasModeStyles', () => {
	it('sets data-canvas-mode on the container', () => {
		const container = document.createElement('div')
		applyCanvasModeStyles(container, getCanvasModeById('sky'))
		expect(container.getAttribute('data-canvas-mode')).toBe('sky')
	})
})

describe('useCanvasMode', () => {
	beforeEach(() => {
		localStorage.removeItem(CANVAS_MODE_STORAGE_KEY)
	})

	it('reads default light when nothing stored', async () => {
		await renderTldrawComponentWithEditor(
			(onMount) => <Tldraw onMount={onMount} components={{ ModeSwitcher: CanvasModeProbe }} />,
			{ waitForPatterns: false }
		)
		const el = await screen.findByTestId('canvas-mode-id')
		expect(el.textContent).toBe('light')
	})

	it('setCanvasMode updates the atom and localStorage', async () => {
		const { editor } = await renderTldrawComponentWithEditor(
			(onMount) => <Tldraw onMount={onMount} components={{ ModeSwitcher: CanvasModeProbe }} />,
			{ waitForPatterns: false }
		)

		await act(async () => {
			screen.getByTestId('set-dark').click()
		})

		await waitFor(() => {
			expect(screen.getByTestId('canvas-mode-id').textContent).toBe('dark')
		})
		expect(editor.getContainer().getAttribute('data-canvas-mode')).toBe('dark')
		expect(localStorage.getItem(CANVAS_MODE_STORAGE_KEY)).toBe(JSON.stringify('dark'))
	})

	it('invalid persisted value falls back to light', async () => {
		localStorage.setItem(CANVAS_MODE_STORAGE_KEY, JSON.stringify('not-a-mode'))

		await renderTldrawComponentWithEditor(
			(onMount) => <Tldraw onMount={onMount} components={{ ModeSwitcher: CanvasModeProbe }} />,
			{ waitForPatterns: false }
		)

		const el = await screen.findByTestId('canvas-mode-id')
		expect(el.textContent).toBe('light')
	})

	it('mode persists across remounts', async () => {
		localStorage.setItem(CANVAS_MODE_STORAGE_KEY, JSON.stringify('sunset'))

		const first = await renderTldrawComponentWithEditor(
			(onMount) => <Tldraw onMount={onMount} components={{ ModeSwitcher: CanvasModeProbe }} />,
			{ waitForPatterns: false }
		)
		expect((await screen.findByTestId('canvas-mode-id')).textContent).toBe('sunset')
		first.rendered.unmount()

		await renderTldrawComponentWithEditor(
			(onMount) => <Tldraw onMount={onMount} components={{ ModeSwitcher: CanvasModeProbe }} />,
			{ waitForPatterns: false }
		)
		expect((await screen.findByTestId('canvas-mode-id')).textContent).toBe('sunset')
	})
})
