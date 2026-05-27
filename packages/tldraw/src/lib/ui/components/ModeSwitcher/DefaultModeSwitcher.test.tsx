import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Tldraw, type TLComponents } from '../../../Tldraw'
import { renderTldrawComponentWithEditor } from '../../../../test/testutils/renderTldrawComponent'
import { CANVAS_MODES } from './modes'

const translationOverrides = {
	en: {
		'mode.menu.title': 'Canvas mode',
		'mode.light.label': 'Light mode',
		'mode.dark.label': 'Dark mode',
		'mode.sky.label': 'Sky mode',
		'mode.sunrise.label': 'Sunrise mode',
		'mode.sunset.label': 'Sunset mode',
	},
}

async function renderEditor(components?: TLComponents) {
	return await renderTldrawComponentWithEditor(
		(onMount) => (
			<Tldraw onMount={onMount} components={components} overrides={{ translations: translationOverrides }} />
		),
		{ waitForPatterns: false }
	)
}

function openModeSwitcher(button: HTMLElement) {
	button.focus()
	fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
}

describe('DefaultModeSwitcher', () => {
	beforeEach(() => {
		window.localStorage.clear()
	})

	it('renders the trigger with the canvas mode aria-label and defaults to light mode', async () => {
		const { editor } = await renderEditor()

		const button = await screen.findByTestId('mode-switcher.button')

		expect(button.getAttribute('aria-label')).toBe('mode.menu.title')
		expect(button.style.getPropertyValue('--tlui-mode-switcher-swatch')).toBe('#ffffff')
		expect(editor.getContainer().getAttribute('data-canvas-mode')).toBe('light')
	})

	it('opens the menu and lists all five modes', async () => {
		await renderEditor()

		openModeSwitcher(await screen.findByTestId('mode-switcher.button'))

		await screen.findByTestId('mode-switcher.light')
		const labels = CANVAS_MODES.map((mode) => screen.getByTestId(`mode-switcher.${mode.id}`))
		expect(labels).toHaveLength(5)
		expect(labels.map((item) => item.textContent?.trim())).toEqual([
			'mode.light.label',
			'mode.dark.label',
			'mode.sky.label',
			'mode.sunrise.label',
			'mode.sunset.label',
		])
	})

	it('selects a mode, closes the menu, and updates the trigger swatch', async () => {
		const { editor } = await renderEditor()

		openModeSwitcher(await screen.findByTestId('mode-switcher.button'))
		fireEvent.click(await screen.findByTestId('mode-switcher.sunrise'))

		await waitFor(() => {
			expect(screen.queryByTestId('mode-switcher.menu')).toBeNull()
		})
		expect(screen.getByTestId('mode-switcher.button').style.getPropertyValue('--tlui-mode-switcher-swatch')).toBe(
			'linear-gradient(135deg, #ffd6e7 0%, #e0c8ff 100%)'
		)
		expect(editor.getContainer().getAttribute('data-canvas-mode')).toBe('sunrise')
	})

	it('restores persisted mode into the trigger and container', async () => {
		window.localStorage.setItem('tldraw_canvas_mode', JSON.stringify('sky'))
		const { editor } = await renderEditor()

		await waitFor(() => {
			expect(
				screen.getByTestId('mode-switcher.button').style.getPropertyValue('--tlui-mode-switcher-swatch')
			).toBe('#cfe8ff')
		})
		expect(editor.getContainer().getAttribute('data-canvas-mode')).toBe('sky')
	})

	it('can be hidden or replaced with the components prop', async () => {
		const hidden = await renderEditor({ ModeSwitcher: null })
		expect(screen.queryByTestId('mode-switcher.button')).toBeNull()
		hidden.rendered.unmount()

		await renderEditor({
			ModeSwitcher: () => <div data-testid="custom-mode-switcher">Custom mode switcher</div>,
		})

		expect((await screen.findByTestId('custom-mode-switcher')).textContent).toBe(
			'Custom mode switcher'
		)
	})
})
