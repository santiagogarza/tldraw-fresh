import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { Tldraw } from '../../../Tldraw'
import { renderTldrawComponentWithEditor } from '../../../../test/testutils/renderTldrawComponent'
import { CANVAS_MODE_STORAGE_KEY, useCanvasMode } from './useCanvasMode'

function CanvasModeProbe() {
	const { canvasMode, canvasModeId, setCanvasMode } = useCanvasMode()
	return (
		<button
			data-testid="canvas-mode-probe"
			data-mode-id={canvasModeId}
			data-mode-background={canvasMode.background}
			onClick={() => setCanvasMode('sunset')}
		>
			{canvasModeId}
		</button>
	)
}

async function renderProbe() {
	return await renderTldrawComponentWithEditor(
		(onMount) => (
			<Tldraw onMount={onMount} components={{ ModeSwitcher: null }}>
				<CanvasModeProbe />
			</Tldraw>
		),
		{ waitForPatterns: false }
	)
}

describe('useCanvasMode', () => {
	beforeEach(() => {
		window.localStorage.clear()
	})

	it('reads light mode by default and applies the container attribute', async () => {
		const { editor } = await renderProbe()

		await screen.findByTestId('canvas-mode-probe')

		expect(screen.getByTestId('canvas-mode-probe').getAttribute('data-mode-id')).toBe('light')
		expect(editor.getContainer().getAttribute('data-canvas-mode')).toBe('light')
		expect(editor.getContainer().style.getPropertyValue('--tl-color-selected')).toBe(
			'hsl(214, 84%, 56%)'
		)
	})

	it('sets the mode and persists it to localStorage', async () => {
		const { editor } = await renderProbe()

		fireEvent.click(await screen.findByTestId('canvas-mode-probe'))

		await waitFor(() => {
			expect(screen.getByTestId('canvas-mode-probe').getAttribute('data-mode-id')).toBe('sunset')
		})
		expect(editor.getContainer().getAttribute('data-canvas-mode')).toBe('sunset')
		expect(window.localStorage.getItem(CANVAS_MODE_STORAGE_KEY)).toBe(JSON.stringify('sunset'))
	})

	it('restores a persisted mode across remounts', async () => {
		let result = await renderProbe()

		fireEvent.click(await screen.findByTestId('canvas-mode-probe'))
		await waitFor(() => {
			expect(window.localStorage.getItem(CANVAS_MODE_STORAGE_KEY)).toBe(JSON.stringify('sunset'))
		})

		act(() => result.rendered.unmount())

		result = await renderProbe()

		await waitFor(() => {
			expect(screen.getByTestId('canvas-mode-probe').getAttribute('data-mode-id')).toBe('sunset')
		})
		expect(result.editor.getContainer().getAttribute('data-canvas-mode')).toBe('sunset')
	})

	it('falls back to light mode for invalid persisted values', async () => {
		window.localStorage.setItem(CANVAS_MODE_STORAGE_KEY, JSON.stringify('nope'))

		const { editor } = await renderProbe()

		await waitFor(() => {
			expect(screen.getByTestId('canvas-mode-probe').getAttribute('data-mode-id')).toBe('light')
		})
		expect(editor.getContainer().getAttribute('data-canvas-mode')).toBe('light')
		expect(window.localStorage.getItem(CANVAS_MODE_STORAGE_KEY)).toBe(JSON.stringify('light'))
	})
})
