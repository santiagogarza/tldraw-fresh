import { Locator, Page } from '@playwright/test'

const MODE_IDS = ['light', 'dark', 'sky', 'sunrise', 'sunset'] as const
export type CanvasModeId = (typeof MODE_IDS)[number]

export class ModeSwitcher {
	readonly trigger: Locator
	readonly menu: Locator
	readonly items: Locator

	constructor(public readonly page: Page) {
		this.page = page
		this.trigger = this.page.getByTestId('mode-switcher.button')
		this.menu = this.page.getByTestId('mode-switcher.menu')
		this.items = this.menu.locator('[data-testid^="mode-switcher.item."]')
	}

	getItem(id: CanvasModeId): Locator {
		return this.page.getByTestId(`mode-switcher.item.${id}`)
	}

	async open() {
		await this.trigger.click()
	}

	async select(id: CanvasModeId) {
		await this.open()
		await this.getItem(id).click()
	}

	static modeIds(): readonly CanvasModeId[] {
		return MODE_IDS
	}
}
