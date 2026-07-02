import { expect } from '@playwright/test'
import test from '../fixtures/fixtures'

test.describe('Examples shell', () => {
	test('updates the sidebar when dark mode is toggled', async ({ page }) => {
		await page.goto('http://localhost:5420')
		await page.waitForSelector('.tl-canvas')

		const sidebarHeader = page.locator('.example__sidebar__category__header').first()
		await expect(sidebarHeader).toBeVisible()

		await expect(page.locator('.tl-container')).toHaveClass(/tl-theme__light/)
		await expect(sidebarHeader).toHaveCSS('color', 'rgb(28, 28, 28)')

		await page.locator('.tl-container').focus()
		await page.keyboard.press('Control+/')

		await expect(page.locator('.tl-container')).toHaveClass(/tl-theme__dark/)
		await expect(sidebarHeader).toHaveCSS('color', 'rgb(241, 238, 238)')
	})
})
