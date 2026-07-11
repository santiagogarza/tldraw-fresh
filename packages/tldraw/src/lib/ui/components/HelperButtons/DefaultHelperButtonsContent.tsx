import { BackToContent } from './BackToContent'
import { ExitPenMode } from './ExitPenMode'
import { StopFollowing } from './StopFollowing'
import { ToggleColorMode } from './ToggleColorMode'

/** @public @react */
export function DefaultHelperButtonsContent() {
	return (
		<>
			<ToggleColorMode />
			<ExitPenMode />
			<BackToContent />
			<StopFollowing />
		</>
	)
}
