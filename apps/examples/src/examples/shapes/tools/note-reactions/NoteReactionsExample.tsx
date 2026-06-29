import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function NoteReactionsExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw persistenceKey="note-reactions-demo" />
		</div>
	)
}
