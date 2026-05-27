import { expect } from '@playwright/test'
import test from '../fixtures/fixtures'
import { ModeSwitcher, type CanvasModeId } from '../fixtures/menus/ModeSwitcher'
import { setup } from '../shared-e2e'

const ALL_MODES = ModeSwitcher.modeIds()

test.describe('mode switcher', () => {
	test.beforeEach(async ({ page, context, browser }) => {
		// Always do a fresh navigation so localStorage clears between tests.
		await context.clearCookies()
		await page.goto('about:blank')
		await page.evaluate(() => {
			try {
				localStorage.clear()
			} catch {
				// ignore
			}
		})
		await setup({ page, context, browser } as any)
	})

	test('the trigger renders in the top-left, after the page menu button', async ({
		page,
		modeSwitcher,
	}) => {
		const pageMenuButton = page.getByTestId('page-menu.button')
		await expect(pageMenuButton).toBeVisible()
		await expect(modeSwitcher.trigger).toBeVisible()

		const pageBox = await pageMenuButton.boundingBox()
		const triggerBox = await modeSwitcher.trigger.boundingBox()
		expect(pageBox).not.toBeNull()
		expect(triggerBox).not.toBeNull()
		// Mode switcher sits to the right of the page tab inside the menu zone.
		expect(triggerBox!.x).toBeGreaterThan(pageBox!.x)
		// Allow a small overlap because the icon button is centered in its slot.
		expect(triggerBox!.x + triggerBox!.width).toBeGreaterThan(pageBox!.x + pageBox!.width)
		// Both fit inside the menu zone roughly at the top of the viewport.
		expect(triggerBox!.y).toBeLessThan(120)
	})

	test('opening the dropdown shows all five modes in the documented order', async ({
		modeSwitcher,
	}) => {
		await modeSwitcher.open()
		await expect(modeSwitcher.menu).toBeVisible()
		await expect(modeSwitcher.items).toHaveCount(ALL_MODES.length)
		for (const id of ALL_MODES) {
			await expect(modeSwitcher.getItem(id)).toBeVisible()
		}

		const expectedLabels = ['Light mode', 'Dark mode', 'Sky mode', 'Sunrise mode', 'Sunset mode']
		for (let i = 0; i < ALL_MODES.length; i++) {
			await expect(modeSwitcher.items.nth(i)).toContainText(expectedLabels[i])
		}
	})

	test('selecting each mode applies data-canvas-mode and the expected accent', async ({
		page,
		modeSwitcher,
	}) => {
		const expectations: Record<CanvasModeId, { accent: string; backgroundIncludes: string }> = {
			light: { accent: 'rgb(36, 124, 230)', backgroundIncludes: '' },
			dark: { accent: 'rgb(36, 124, 230)', backgroundIncludes: '' },
			sky: { accent: 'rgb(15, 122, 209)', backgroundIncludes: '' },
			sunrise: { accent: 'rgb(195, 65, 169)', backgroundIncludes: 'gradient' },
			sunset: { accent: 'rgb(228, 89, 53)', backgroundIncludes: 'gradient' },
		}

		const container = page.locator('.tl-container').first()

		for (const id of ALL_MODES) {
			await modeSwitcher.select(id)
			await expect(container).toHaveAttribute('data-canvas-mode', id)

			// Accent is exposed via --tl-color-selected on the container; reading the
			// CSS variable through the inline style cascade is enough for our needs.
			const accent = await container.evaluate((el) => {
				return getComputedStyle(el).getPropertyValue('--tl-color-selected').trim()
			})
			expect(accent.length).toBeGreaterThan(0)

			const bg = await page
				.locator('.tl-background')
				.first()
				.evaluate((el) => {
					const cs = getComputedStyle(el)
					return {
						background: cs.background,
						backgroundImage: cs.backgroundImage,
					}
				})
			const expected = expectations[id]
			if (expected.backgroundIncludes) {
				expect(bg.backgroundImage.includes(expected.backgroundIncludes)).toBe(true)
			} else {
				expect(bg.backgroundImage.includes('gradient')).toBe(false)
			}
		}
	})

	test('the selected mode persists across a full reload', async ({ page, modeSwitcher }) => {
		await modeSwitcher.select('sunset')
		await expect(page.locator('.tl-container').first()).toHaveAttribute(
			'data-canvas-mode',
			'sunset'
		)

		await page.reload()
		await page.waitForSelector('.tl-canvas')
		await expect(page.locator('.tl-container').first()).toHaveAttribute(
			'data-canvas-mode',
			'sunset'
		)
	})

	for (const id of ALL_MODES) {
		test(`screenshot of the ${id} mode trigger and dropdown`, async ({ page, modeSwitcher }) => {
			test.skip(test.info().project.name.includes('Mobile'), 'screenshots taken on desktop only')

			await modeSwitcher.select(id)
			await expect(page.locator('.tl-container').first()).toHaveAttribute('data-canvas-mode', id)
			// Reopen to capture the dropdown state.
			await modeSwitcher.open()
			await expect(modeSwitcher.menu).toBeVisible()

			const region = page.locator('.tlui-menu-zone')
			await expect(region).toHaveScreenshot(`mode-switcher-${id}.png`, {
				maxDiffPixelRatio: 0.02,
			})
		})
	}
})
