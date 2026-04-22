import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { createShapeId, Editor, TLShapeId } from '@tldraw/editor'
import { Tldraw } from '../../lib/Tldraw'
import { renderTldrawComponentWithEditor } from '../testutils/renderTldrawComponent'

let editor: Editor

beforeEach(async () => {
	const result = await renderTldrawComponentWithEditor((onMount) => <Tldraw onMount={onMount} />, {
		waitForPatterns: false,
	})
	editor = result.editor
})

function createAndSelectGeo(): TLShapeId {
	const id = createShapeId()
	act(() => {
		editor.createShape({ id, type: 'geo', x: 0, y: 0, props: { w: 100, h: 100 } })
		editor.select(id)
	})
	return id
}

describe('StylePanelAnimationPicker', () => {
	it('is hidden when no shape is selected', async () => {
		await waitFor(() => {
			expect(screen.queryByTestId('style.animation')).toBeNull()
		})
	})

	it('appears once a shape is selected and defaults to "none"', async () => {
		createAndSelectGeo()
		await waitFor(() => {
			const noneButton = screen.getByTestId('style.animation.none')
			expect(noneButton).not.toBeNull()
			expect(noneButton.getAttribute('data-isactive')).toBe('true')
		})
	})

	it('writes meta.animation on the selected shape when a kind is clicked', async () => {
		const id = createAndSelectGeo()
		const jiggleButton = await screen.findByTestId('style.animation.jiggle')
		await act(async () => {
			fireEvent.click(jiggleButton)
		})
		expect((editor.getShape(id)?.meta as { animation?: string })?.animation).toBe('jiggle')

		const spinButton = await screen.findByTestId('style.animation.spin')
		await act(async () => {
			fireEvent.click(spinButton)
		})
		expect((editor.getShape(id)?.meta as { animation?: string })?.animation).toBe('spin')
	})

	it('applies to every selected shape and undoes as a single step', async () => {
		const idA = createShapeId()
		const idB = createShapeId()
		act(() => {
			editor.createShape({ id: idA, type: 'geo', x: 0, y: 0, props: { w: 100, h: 100 } })
			editor.createShape({ id: idB, type: 'geo', x: 200, y: 0, props: { w: 100, h: 100 } })
			editor.select(idA, idB)
		})

		const pulseButton = await screen.findByTestId('style.animation.pulse')
		await act(async () => {
			fireEvent.click(pulseButton)
		})
		expect((editor.getShape(idA)?.meta as { animation?: string })?.animation).toBe('pulse')
		expect((editor.getShape(idB)?.meta as { animation?: string })?.animation).toBe('pulse')

		act(() => {
			editor.undo()
		})
		expect((editor.getShape(idA)?.meta as { animation?: string })?.animation).toBeUndefined()
		expect((editor.getShape(idB)?.meta as { animation?: string })?.animation).toBeUndefined()
	})
})
