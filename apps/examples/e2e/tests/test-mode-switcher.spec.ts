import { expect, type Page } from '@playwright/test'
import test from '../fixtures/fixtures'

const CANVAS_MODE_STORAGE_KEY = 'tldraw_canvas_mode'

const modes = [
	{
		id: 'light',
		label: 'Light mode',
		accent: 'hsl(214, 84%, 56%)',
		backgroundColor: 'rgb(255, 255, 255)',
		backgroundImage: 'none',
	},
	{
		id: 'dark',
		label: 'Dark mode',
		accent: 'hsl(214, 84%, 56%)',
		backgroundColor: 'rgb(14, 14, 16)',
		backgroundImage: 'none',
	},
	{
		id: 'sky',
		label: 'Sky mode',
		accent: '#1f8adf',
		backgroundColor: 'rgb(207, 232, 255)',
		backgroundImage: 'none',
	},
	{
		id: 'sunrise',
		label: 'Sunrise mode',
		accent: '#b653d9',
		backgroundImage: 'linear-gradient',
	},
	{
		id: 'sunset',
		label: 'Sunset mode',
		accent: '#f25a2a',
		backgroundImage: 'linear-gradient',
	},
] as const

async function setupDefaultExample(page: Page) {
	await page.goto('http://localhost:5420/')
	await page.evaluate((key) => window.localStorage.removeItem(key), CANVAS_MODE_STORAGE_KEY)
	await page.reload()
	await page.waitForSelector('.tl-container')
	await page.locator('.tl-container').focus()
}

async function openModeSwitcher(page: Page) {
	await page.getByTestId('mode-switcher.button').click()
	await expect(page.getByTestId('mode-switcher.menu')).toBeVisible()
}

async function selectMode(page: Page, modeId: (typeof modes)[number]['id']) {
	await openModeSwitcher(page)
	await page.getByTestId(`mode-switcher.${modeId}`).click()
	await expect(page.locator('.tl-container')).toHaveAttribute('data-canvas-mode', modeId)
}

async function getModeStyles(page: Page) {
	return await page.evaluate(() => {
		const container = document.querySelector<HTMLElement>('.tl-container')!
		const background = container.querySelector<HTMLElement>('.tl-background')!
		const containerStyles = getComputedStyle(container)
		const backgroundStyles = getComputedStyle(background)
		return {
			backgroundColor: backgroundStyles.backgroundColor,
			backgroundImage: backgroundStyles.backgroundImage,
			selected: containerStyles.getPropertyValue('--tl-color-selected').trim(),
			primary: containerStyles.getPropertyValue('--tl-color-primary').trim(),
		}
	})
}

test.describe('mode switcher', () => {
	test.beforeEach(async ({ page }) => {
		await setupDefaultExample(page)
	})

	test('is visible after the page menu and lists all modes', async ({ page }) => {
		const pageMenu = page.getByTestId('page-menu.button')
		const modeSwitcher = page.getByTestId('mode-switcher.button')

		await expect(pageMenu).toBeVisible()
		await expect(modeSwitcher).toBeVisible()

		const pageMenuBox = await pageMenu.boundingBox()
		const modeSwitcherBox = await modeSwitcher.boundingBox()
		expect(modeSwitcherBox!.x).toBeGreaterThan(pageMenuBox!.x)

		await openModeSwitcher(page)
		for (const mode of modes) {
			await expect(page.getByTestId(`mode-switcher.${mode.id}`)).toContainText(mode.label)
		}
	})

	test('updates canvas styles for every mode and persists across reloads', async ({ page }) => {
		for (const mode of modes) {
			await selectMode(page, mode.id)
			const styles = await getModeStyles(page)

			expect(styles.selected).toBe(mode.accent)
			expect(styles.primary).toBe(mode.accent)
			if (mode.backgroundImage === 'linear-gradient') {
				expect(styles.backgroundImage).toContain('gradient')
			} else {
				expect(styles.backgroundImage).toBe(mode.backgroundImage)
				expect(styles.backgroundColor).toBe(mode.backgroundColor)
			}
		}

		await page.reload()
		await expect(page.locator('.tl-container')).toHaveAttribute('data-canvas-mode', 'sunset')
	})

	test('captures the top-left UI for each mode', async ({ page }) => {
		test.skip(
			test.info().project.name.includes('Mobile'),
			'Mode switcher screenshots are desktop-only.'
		)

		for (const mode of modes) {
			await selectMode(page, mode.id)
			await expect(page.locator('.tlui-menu-zone')).toHaveScreenshot(`mode-switcher-${mode.id}.png`)
		}
	})
})
