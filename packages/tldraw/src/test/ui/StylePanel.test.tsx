import { act, screen, waitFor } from '@testing-library/react'
import { createShapeId } from '@tldraw/editor'
import { Tldraw } from '../../lib/Tldraw'
import { renderTldrawComponentWithEditor } from '../testutils/renderTldrawComponent'

it('keeps the placeholder vertical align button disabled with hover affordance', async () => {
	const { editor } = await renderTldrawComponentWithEditor(
		(onMount) => (
			<Tldraw
				onMount={(mountedEditor) => {
					onMount(mountedEditor)
					mountedEditor.createShape({
						id: createShapeId(),
						type: 'text',
						x: 100,
						y: 100,
						props: { text: 'Hello world' },
					})
				}}
			/>
		),
		{ waitForPatterns: false }
	)

	act(() => {
		editor.selectAll()
	})

	const stylePanel = await screen.findByTestId('style.panel')

	await waitFor(() => {
		const button = stylePanel.querySelector('[data-testid="vertical-align"]') as HTMLButtonElement | null
		expect(button).not.toBeNull()
		expect(button?.disabled).toBe(true)
		expect(button?.classList.contains('tlui-button--allow-disabled-hover')).toBe(true)
	})
})
