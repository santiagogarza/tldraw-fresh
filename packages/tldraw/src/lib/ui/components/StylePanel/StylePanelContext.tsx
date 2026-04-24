import {
	type TLDefaultColorStyle,
	ReadonlySharedStyleMap,
	StyleProp,
	unsafe__withoutCapture,
	useEditor,
	useValue,
} from '@tldraw/editor'
import { createContext, useCallback, useContext, useEffect } from 'react'
import { useUiEvents } from '../../context/events'
import { useRecentShapeColors } from '../../hooks/useRecentShapeColors'

function serializeStyleValueForAnalytics(value: unknown): string {
	if (value && typeof value === 'object' && (value as { type?: string }).type === 'custom') {
		const v = (value as { value?: string }).value
		return v ? `custom:${v}` : 'custom'
	}
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return String(value)
	}
	try {
		return JSON.stringify(value)
	} catch {
		return ''
	}
}

/** @public */
export interface StylePanelContext {
	styles: ReadonlySharedStyleMap
	enhancedA11yMode: boolean
	recentShapeColors: TLDefaultColorStyle[]
	recentColorsUserId: string
	reloadRecentShapeColors(): void
	onHistoryMark(id: string): void
	onValueChange<T>(style: StyleProp<T>, value: T): void
	onColorStyleApplied(value: TLDefaultColorStyle): void
	onOpacityChange(opacity: number): void
}
const StylePanelContext = createContext<null | StylePanelContext>(null)

/** @public */
export interface StylePanelContextProviderProps {
	children: React.ReactNode
	styles: ReadonlySharedStyleMap
}

function StylePanelContextProviderInner({ children, styles }: StylePanelContextProviderProps) {
	const editor = useEditor()
	const trackEvent = useUiEvents()

	const userId = useValue('user id for recents', () => editor.user.getId(), [editor])
	const { recentColors, pushRecent, reloadFromStorage } = useRecentShapeColors(userId)
	const onHistoryMark = useCallback((id: string) => editor.markHistoryStoppingPoint(id), [editor])
	const enhancedA11yMode = useValue('enhancedA11yMode', () => editor.user.getEnhancedA11yMode(), [
		editor,
	])

	const onValueChange = useCallback(
		function <T>(style: StyleProp<T>, value: T) {
			const skipNextShapeStyle = unsafe__withoutCapture(
				() => editor.getSelectedShapeIds().length > 0 && editor.inputs.getAccelKey()
			)
			editor.run(() => {
				if (editor.isIn('select')) {
					editor.setStyleForSelectedShapes(style, value)
				}
				if (!skipNextShapeStyle) {
					editor.setStyleForNextShapes(style, value)
				}
				editor.updateInstanceState({ isChangingStyle: true })
			})

			trackEvent('set-style', {
				source: 'style-panel',
				id: style.id,
				value: serializeStyleValueForAnalytics(value),
			})
		},
		[editor, trackEvent]
	)

	const onColorStyleApplied = useCallback(
		(value: TLDefaultColorStyle) => {
			pushRecent(value)
		},
		[pushRecent]
	)

	const reloadRecentShapeColors = useCallback(() => {
		reloadFromStorage(userId)
	}, [reloadFromStorage, userId])

	const onOpacityChange = useCallback(
		function (opacity: number) {
			const skipNextShapeStyle = unsafe__withoutCapture(
				() => editor.getSelectedShapeIds().length > 0 && editor.inputs.getAccelKey()
			)

			editor.run(() => {
				if (editor.isIn('select')) {
					editor.setOpacityForSelectedShapes(opacity)
				}
				if (!skipNextShapeStyle) {
					editor.setOpacityForNextShapes(opacity)
				}
				editor.updateInstanceState({ isChangingStyle: true })
			})

			trackEvent('set-style', { source: 'style-panel', id: 'opacity', value: opacity })
		},
		[editor, trackEvent]
	)

	// Re-read localStorage on window focus (multi-tab, external edits)
	useEffect(() => {
		const win = editor.getContainerWindow()
		const onFocus = () => reloadFromStorage(userId)
		win.addEventListener('focus', onFocus)
		return () => win.removeEventListener('focus', onFocus)
	}, [editor, reloadFromStorage, userId])

	return (
		<StylePanelContext.Provider
			value={{
				styles: styles,
				enhancedA11yMode,
				recentShapeColors: recentColors,
				recentColorsUserId: userId,
				reloadRecentShapeColors,
				onHistoryMark,
				onValueChange,
				onColorStyleApplied,
				onOpacityChange,
			}}
		>
			{children}
		</StylePanelContext.Provider>
	)
}

/** @public @react */
export function StylePanelContextProvider(props: StylePanelContextProviderProps) {
	return <StylePanelContextProviderInner {...props} />
}

/** @public */
export function useStylePanelContext() {
	const context = useContext(StylePanelContext)
	if (!context) {
		throw new Error('useStylePanelContext must be used within a StylePanelContextProvider')
	}
	return context
}
