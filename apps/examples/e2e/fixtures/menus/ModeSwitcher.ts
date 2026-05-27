import { Locator, Page } from '@playwright/test'

export class ModeSwitcher {
	readonly button: Locator
	readonly popover: Locator
	readonly modeItems: Locator

	constructor(public readonly page: Page) {
		this.page = page
		this.button = this.page.getByTestId('mode-switcher.button')
		this.popover = this.page.getByTestId('mode-switcher.popover')
		this.modeItems = this.page.getByTestId(/^mode-switcher\\.item-/)
	}

	getModeItem(modeId: 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset') {
		return this.page.getByTestId(`mode-switcher.item-${modeId}`)
	}

	async open() {
		await this.button.click()
	}

	async select(modeId: 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset') {
		await this.open()
		await this.getModeItem(modeId).click()
	}
}
