import { useValue } from '@tldraw/state-react'
import { useEditor } from '../../hooks/useEditor'

/** @public @react */
export function DefaultBackground() {
	const editor = useEditor()
	const backgroundStyle = useValue(
		'canvas background style',
		() => {
			const colors = editor.getCurrentTheme().colors[editor.getColorMode()]
			if (colors.backgroundGradient) {
				return { background: colors.backgroundGradient }
			}
			return { backgroundColor: colors.background }
		},
		[editor]
	)

	return <div className="tl-background" style={backgroundStyle} />
}
