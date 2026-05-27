import { Page, expect } from '@playwright/test'
import test from '../fixtures/fixtures'

const MODES = [
	{
		id: 'light',
		label: 'Light mode',
		accent: '#3183ed',
		expectsGradient: false,
	},
	{
		id: 'dark',
		label: 'Dark mode',
		accent: '#3183ed',
		expectsGradient: false,
	},
	{
		id: 'sky',
		label: 'Sky mode',
		accent: '#3f8efc',
		expectsGradient: false,
	},
	{
		id: 'sunrise',
		label: 'Sunrise mode',
		accent: '#d45aa3',
		expectsGradient: true,
	},
	{
		id: 'sunset',
		label: 'Sunset mode',
		accent: '#ff5c33',
		expectsGradient: true,
	},
] as const

async function setupDefaultExample(page: Page) {
	await page.goto('http://localhost:5420/')
	await page.waitForSelector('.tl-canvas')
	await page.waitForSelector('[data-testid="mode-switcher.button"]')
}

test.describe('mode switcher', () => {
	test.beforeEach(async ({ page }) => {
		await setupDefaultExample(page)
	})

	test('is visible in the top-left next to the page menu', async ({ modeSwitcher, pageMenu }) => {
		await expect(modeSwitcher.button).toBeVisible()
		await expect(pageMenu.pagemenuButton).toBeVisible()

		const pageMenuBox = await pageMenu.pagemenuButton.boundingBox()
		const switcherBox = await modeSwitcher.button.boundingBox()

		expect(pageMenuBox).not.toBeNull()
		expect(switcherBox).not.toBeNull()
		expect((switcherBox?.x ?? 0) + 1).toBeGreaterThan(pageMenuBox?.x ?? 0)
	})

	test('opens and shows all five mode options in order', async ({ modeSwitcher }) => {
		await modeSwitcher.open()
		await expect(modeSwitcher.popover).toBeVisible()

		const itemTestIds = await modeSwitcher.modeItems.evaluateAll((elements) =>
			elements.map((element) => element.getAttribute('data-testid'))
		)
		expect(itemTestIds).toEqual([
			'mode-switcher.item-light',
			'mode-switcher.item-dark',
			'mode-switcher.item-sky',
			'mode-switcher.item-sunrise',
			'mode-switcher.item-sunset',
		])

		for (const mode of MODES) {
			await expect(modeSwitcher.getModeItem(mode.id)).toContainText(mode.label)
		}
	})

	test('updates container mode, background, and accent for every mode', async ({
		page,
		modeSwitcher,
		isMobile,
	}) => {
		const menuRegion = page.locator('.tlui-layout__top__left')

		for (const mode of MODES) {
			await modeSwitcher.select(mode.id)

			await expect
				.poll(() => page.locator('.tl-container').getAttribute('data-canvas-mode'))
				.toBe(mode.id)

			const background = await page.locator('.tl-background').evaluate((element) => {
				const style = getComputedStyle(element)
				return {
					backgroundImage: style.backgroundImage,
					backgroundColor: style.backgroundColor,
				}
			})

			if (mode.expectsGradient) {
				expect(background.backgroundImage).toContain('linear-gradient')
			} else {
				expect(background.backgroundImage).toBe('none')
			}

			const selectedColor = await page
				.locator('.tl-container')
				.evaluate((element) =>
					getComputedStyle(element).getPropertyValue('--tl-color-selected').trim().toLowerCase()
				)
			expect(selectedColor).toBe(mode.accent)

			if (!isMobile) {
				await expect(menuRegion).toHaveScreenshot(`mode-switcher-${mode.id}.png`)
			}
		}
	})

	test('persists mode selection after a page reload', async ({ page, modeSwitcher }) => {
		await modeSwitcher.select('sunset')
		await expect
			.poll(() => page.locator('.tl-container').getAttribute('data-canvas-mode'))
			.toBe('sunset')

		await page.reload()
		await page.waitForSelector('[data-testid="mode-switcher.button"]')

		await expect
			.poll(() => page.locator('.tl-container').getAttribute('data-canvas-mode'))
			.toBe('sunset')
	})
})
