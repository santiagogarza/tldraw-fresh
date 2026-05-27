import { Locator, Page } from '@playwright/test'

export class ModeSwitcher {
	readonly button: Locator
	readonly items: Locator

	constructor(public readonly page: Page) {
		this.page = page
		this.button = this.page.getByTestId('mode-switcher.button')
		this.items = this.page.getByRole('menuitemcheckbox')
	}

	item(id: 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset') {
		return this.page.getByTestId(`mode-switcher.item.${id}`)
	}

	async open() {
		await this.button.click()
	}

	async selectMode(id: 'light' | 'dark' | 'sky' | 'sunrise' | 'sunset') {
		await this.open()
		const labelById = {
			light: 'Light mode',
			dark: 'Dark mode',
			sky: 'Sky mode',
			sunrise: 'Sunrise mode',
			sunset: 'Sunset mode',
		} as const
		await this.page.getByRole('menuitemcheckbox', { name: labelById[id] }).click()
	}
}
