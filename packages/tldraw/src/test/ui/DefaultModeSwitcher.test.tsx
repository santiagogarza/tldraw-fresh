import { fireEvent, screen, waitFor } from '@testing-library/react'
import { TLComponents, Tldraw } from '../../lib/Tldraw'
import { renderTldrawComponent } from '../testutils/renderTldrawComponent'

const CANVAS_MODE_STORAGE_KEY = 'tldraw-canvas-mode'

beforeEach(() => {
	window.localStorage.removeItem(CANVAS_MODE_STORAGE_KEY)
})

afterEach(() => {
	window.localStorage.removeItem(CANVAS_MODE_STORAGE_KEY)
})

function getContainer() {
	const container = document.querySelector('.tl-container')
	if (!container) throw new Error('Expected a tldraw container element')
	return container as HTMLElement
}

it('renders the trigger button with menu aria label and default light mode', async () => {
	await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })

	const button = await screen.findByTestId('mode-switcher.button')
	expect(button.getAttribute('aria-label')).toBe('mode.menu.title')

	await waitFor(() => {
		expect(getContainer().getAttribute('data-canvas-mode')).toBe('light')
	})
})

it('opens the popover and lists all five modes', async () => {
	await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })

	fireEvent.click(await screen.findByTestId('mode-switcher.button'))

	await screen.findByTestId('mode-switcher.popover')
	await screen.findByTestId('mode-switcher.item-light')
	await screen.findByTestId('mode-switcher.item-dark')
	await screen.findByTestId('mode-switcher.item-sky')
	await screen.findByTestId('mode-switcher.item-sunrise')
	await screen.findByTestId('mode-switcher.item-sunset')

	expect(screen.getByTestId('mode-switcher.item-light').textContent).toContain('mode.light.label')
	expect(screen.getByTestId('mode-switcher.item-dark').textContent).toContain('mode.dark.label')
	expect(screen.getByTestId('mode-switcher.item-sky').textContent).toContain('mode.sky.label')
	expect(screen.getByTestId('mode-switcher.item-sunrise').textContent).toContain(
		'mode.sunrise.label'
	)
	expect(screen.getByTestId('mode-switcher.item-sunset').textContent).toContain('mode.sunset.label')
})

it('selects a mode, closes the popover, and updates the trigger swatch', async () => {
	await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })

	const button = await screen.findByTestId('mode-switcher.button')
	fireEvent.click(button)
	fireEvent.click(await screen.findByTestId('mode-switcher.item-dark'))

	await waitFor(() => {
		expect(screen.queryByTestId('mode-switcher.popover')).toBeNull()
		expect(getContainer().getAttribute('data-canvas-mode')).toBe('dark')
		expect(getContainer().style.getPropertyValue('--tl-canvas-mode-background')).toBe('#0e0e10')
	})
})

it('persists mode selection across remounts', async () => {
	const rendered = await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })

	fireEvent.click(await screen.findByTestId('mode-switcher.button'))
	fireEvent.click(await screen.findByTestId('mode-switcher.item-sunset'))

	await waitFor(() => {
		expect(getContainer().getAttribute('data-canvas-mode')).toBe('sunset')
	})

	rendered.unmount()
	await renderTldrawComponent(<Tldraw />, { waitForPatterns: false })

	await waitFor(() => {
		expect(getContainer().getAttribute('data-canvas-mode')).toBe('sunset')
	})
})

it('supports null and custom component overrides via TLComponents', async () => {
	const noModeSwitcherComponents: TLComponents = { ModeSwitcher: null }
	const customModeSwitcherComponents: TLComponents = {
		ModeSwitcher: () => <button data-testid="custom-mode-switcher">Custom mode switcher</button>,
	}

	const withoutSwitcher = await renderTldrawComponent(
		<Tldraw components={noModeSwitcherComponents} />,
		{
			waitForPatterns: false,
		}
	)

	expect(screen.queryByTestId('mode-switcher.button')).toBeNull()
	withoutSwitcher.unmount()

	await renderTldrawComponent(<Tldraw components={customModeSwitcherComponents} />, {
		waitForPatterns: false,
	})

	await screen.findByTestId('custom-mode-switcher')
	expect(screen.queryByTestId('mode-switcher.button')).toBeNull()
})
