import {
	DefaultAnimationStyle,
	TLGeoShape,
	createShapeId,
	defaultShapeSchemas,
} from '@tldraw/editor'
import { TestEditor } from './TestEditor'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
})

afterEach(() => {
	editor?.dispose()
})

it('registers animation style on geo shapes and round-trips through the store', () => {
	expect(defaultShapeSchemas.geo.props.animation).toBe(DefaultAnimationStyle)

	const id = createShapeId('animated-geo')
	editor.createShape({ id, type: 'geo' })

	const shape = editor.getShape<TLGeoShape>(id)!
	expect(shape.props.animation).toBe('none')

	editor.updateShape<TLGeoShape>({ id, type: 'geo', props: { animation: 'spin' } })
	expect(editor.getShape<TLGeoShape>(id)!.props.animation).toBe('spin')

	const snapshot = editor.store.getStoreSnapshot()
	const nextEditor = new TestEditor()
	try {
		nextEditor.loadSnapshot(snapshot)
		expect(nextEditor.getShape<TLGeoShape>(id)!.props.animation).toBe('spin')
	} finally {
		nextEditor.dispose()
	}
})
