import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { TldrawUiTooltipProvider } from '../../lib/ui/components/primitives/TldrawUiTooltip'
import { TldrawUiToolbar, TldrawUiToolbarButton } from '../../lib/ui/components/primitives/TldrawUiToolbar'

vi.mock('../../lib/ui/hooks/useTranslation/useTranslation', () => ({
	useDirection: () => 'ltr',
}))

describe('TldrawUiToolbarButton', () => {
	it('wraps disabled buttons so tooltips can still trigger on hover', () => {
		render(
			<TldrawUiTooltipProvider>
				<TldrawUiToolbar label="Toolbar">
					<TldrawUiToolbarButton type="icon" title="Delete" disabled data-testid="toolbar.delete">
						<span />
					</TldrawUiToolbarButton>
				</TldrawUiToolbar>
			</TldrawUiTooltipProvider>
		)

		const button = screen.getByTestId('toolbar.delete')
		expect(button.parentElement?.classList.contains('tlui-button__tooltip-wrapper')).toBe(true)
	})

	it('does not add the tooltip wrapper for enabled buttons', () => {
		render(
			<TldrawUiTooltipProvider>
				<TldrawUiToolbar label="Toolbar">
					<TldrawUiToolbarButton type="icon" title="Delete" data-testid="toolbar.delete">
						<span />
					</TldrawUiToolbarButton>
				</TldrawUiToolbar>
			</TldrawUiTooltipProvider>
		)

		const button = screen.getByTestId('toolbar.delete')
		expect(button.parentElement?.classList.contains('tlui-button__tooltip-wrapper')).toBe(false)
	})
})
