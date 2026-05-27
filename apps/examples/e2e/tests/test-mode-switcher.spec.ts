import { expect, type Page } from '@playwright/test'
import { type Editor } from 'tldraw'
import test from '../fixtures/fixtures'
import { setupOrReset } from '../shared-e2e'

declare const editor: Editor

const MODES = [
	{ id: 'light' as const, label: 'Light mode', solid: true },
	{ id: 'dark' as const, label: 'Dark mode', solid: true },
	{ id: 'sky' as const, label: 'Sky mode', solid: true },
	{ id: 'sunrise' as const, label: 'Sunrise mode', solid: false },
	{ id: 'sunset' as const, label: 'Sunset mode', solid: false },
]

async function ensureMultiPageMenu(page: Page) {
	await page.evaluate(() => {
		if (editor.getPages().length < 2) {
			editor.createPage({ name: 'Page 2' })
		}
	})
}

test.describe('mode switcher', () => {
	test.beforeEach(async ({ page, context }) => {
		await setupOrReset({ page, context })
		await ensureMultiPageMenu(page)
	})

	test.afterEach(async ({ page }) => {
		await page.keyboard.press('Escape')
		await page.keyboard.press('Escape')
	})

	test('button appears after the page menu in the menu zone', async ({ pageMenu, modeSwitcher }) => {
		await expect(modeSwitcher.button).toBeVisible()
		await expect(pageMenu.pagemenuButton).toBeVisible()

		const pageMenuBox = await pageMenu.pagemenuButton.boundingBox()
		const modeSwitcherBox = await modeSwitcher.button.boundingBox()
		expect(pageMenuBox).not.toBeNull()
		expect(modeSwitcherBox).not.toBeNull()
		if (pageMenuBox && modeSwitcherBox) {
			expect(modeSwitcherBox.x).toBeGreaterThan(pageMenuBox.x)
		}
	})

	test('opens a dropdown with five modes in order', async ({ modeSwitcher }) => {
		await modeSwitcher.open()
		const labels = await modeSwitcher.items.allTextContents()
		expect(labels).toEqual(MODES.map((m) => m.label))
	})

	for (const mode of MODES) {
		test(`selecting ${mode.id} updates canvas styles`, async ({ page, modeSwitcher }) => {
			await modeSwitcher.selectMode(mode.id)

			const container = page.locator('.tl-container')
			await expect(container).toHaveAttribute('data-canvas-mode', mode.id)

			const background = page.locator('.tl-background')
			if (mode.solid) {
				const bgColor = await background.evaluate((el) => getComputedStyle(el).backgroundColor)
				expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
			} else {
				const bgImage = await background.evaluate((el) => getComputedStyle(el).backgroundImage)
				expect(bgImage).toContain('gradient')
			}

			const accent = await page.evaluate(() =>
				getComputedStyle(document.querySelector('.tl-container')!).getPropertyValue('--tl-color-selected').trim()
			)
			expect(accent.length).toBeGreaterThan(0)
		})

		test(`screenshot baseline for ${mode.id} mode`, async ({ page, modeSwitcher }) => {
			await modeSwitcher.selectMode(mode.id)
			const clip = await modeSwitcher.button.boundingBox()
			expect(clip).not.toBeNull()
			if (!clip) return
			await expect(page).toHaveScreenshot(`mode-switcher-${mode.id}.png`, {
				clip: {
					x: Math.max(0, clip.x - 8),
					y: Math.max(0, clip.y - 8),
					width: clip.width + 120,
					height: clip.height + 16,
				},
				maxDiffPixelRatio: 0.02,
			})
		})
	}

	test('persists the selected mode across reload', async ({ page, modeSwitcher }) => {
		await modeSwitcher.selectMode('dark')
		await page.reload()
		await expect(page.locator('.tl-container')).toHaveAttribute('data-canvas-mode', 'dark')
	})
})
