import { BackToContent } from './BackToContent'
import { ExitPenMode } from './ExitPenMode'
import { StopFollowing } from './StopFollowing'
import { ToggleDarkMode } from './ToggleDarkMode'

/** @public @react */
export function DefaultHelperButtonsContent() {
	return (
		<>
			<ExitPenMode />
			<BackToContent />
			<StopFollowing />
			<ToggleDarkMode />
		</>
	)
}
