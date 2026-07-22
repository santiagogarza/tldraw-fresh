import { expect, type Page } from '@playwright/test'
import test from '../fixtures/fixtures'

async function setDarkMode(page: Page, shouldBeDark: boolean, isMac: boolean) {
	const isDark = await page
		.locator('.tl-container')
		.evaluate((container) => container.classList.contains('tl-theme__dark'))

	if (isDark === shouldBeDark) return

	await page.locator('.tl-container').focus()
	await page.keyboard.press(isMac ? 'Meta+/' : 'Control+/')
	await expect(page.locator('.tl-container')).toHaveClass(
		shouldBeDark ? /tl-theme__dark/ : /tl-theme__light/
	)
}

test.describe('Coordinate system example', () => {
	test('updates the debug panel colors in dark mode', async ({ page, isMac }) => {
		await page.goto('http://localhost:5420/coordinate-system/full')
		await page.waitForSelector('.tl-canvas')

		const panel = page.locator('.coordinate-debug-panel')
		await expect(panel).toBeVisible()

		await setDarkMode(page, false, isMac)
		const lightBackground = await panel.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		)

		await setDarkMode(page, true, isMac)
		const darkBackground = await panel.evaluate(
			(element) => getComputedStyle(element).backgroundColor
		)

		expect(darkBackground).not.toBe(lightBackground)
		expect(darkBackground).not.toBe('rgb(255, 255, 255)')
	})
})
