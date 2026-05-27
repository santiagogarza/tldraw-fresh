import { screen } from '@testing-library/react'
import { Tldraw } from '../../lib/Tldraw'
const CANVAS_MODE_STORAGE_KEY = 'tldraw_canvas_mode'
import { renderTldrawComponentWithEditor } from '../testutils/renderTldrawComponent'

beforeEach(() => {
	localStorage.removeItem(CANVAS_MODE_STORAGE_KEY)
})

describe('DefaultModeSwitcher', () => {
	it('renders the trigger with aria-label from mode.menu.title', async () => {
		await renderTldrawComponentWithEditor((onMount) => <Tldraw onMount={onMount} />, {
			waitForPatterns: false,
		})

		const trigger = await screen.findByTestId('mode-switcher.button')
		expect(trigger.getAttribute('aria-label')).toBe('mode.menu.title')
	})

	it('applies the default light mode to the container on mount', async () => {
		const { editor } = await renderTldrawComponentWithEditor(
			(onMount) => <Tldraw onMount={onMount} />,
			{ waitForPatterns: false }
		)

		expect(editor.getContainer().getAttribute('data-canvas-mode')).toBe('light')
	})

	it('can be disabled via components override', async () => {
		await renderTldrawComponentWithEditor(
			(onMount) => <Tldraw onMount={onMount} components={{ ModeSwitcher: null }} />,
			{ waitForPatterns: false }
		)

		expect(screen.queryByTestId('mode-switcher.button')).toBeNull()
	})
})
