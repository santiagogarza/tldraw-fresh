import {
	DefaultAnimationStyle,
	createShapeId,
	defaultShapeSchemas,
	getSnapshot,
	loadSnapshot,
} from '@tldraw/editor'
import { TestEditor } from './TestEditor'

describe('animation style prop', () => {
	let editor: TestEditor

	beforeEach(() => {
		editor = new TestEditor()
	})

	it('is registered on the geo shape schema', () => {
		expect(defaultShapeSchemas.geo.props.animation).toBe(DefaultAnimationStyle)
	})

	it('defaults to "none" when a geo shape is created without specifying it', () => {
		const id = createShapeId()
		editor.createShapes([{ id, type: 'geo', x: 0, y: 0 }])
		const shape = editor.getShape(id) as { props: { animation: string } } | undefined
		expect(shape?.props.animation).toBe('none')
	})

	it('round-trips through getStoreSnapshot/loadSnapshot', () => {
		const id = createShapeId()
		editor.createShapes([{ id, type: 'geo', x: 0, y: 0 }])
		editor.updateShape({ id, type: 'geo', props: { animation: 'spin' } })

		const beforeShape = editor.getShape(id) as { props: { animation: string } }
		expect(beforeShape.props.animation).toBe('spin')

		const snapshot = getSnapshot(editor.store)
		const newEditor = new TestEditor()
		loadSnapshot(newEditor.store, snapshot)

		const afterShape = newEditor.getShape(id) as { props: { animation: string } } | undefined
		expect(afterShape?.props.animation).toBe('spin')
	})
})
