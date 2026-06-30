import {
	DefaultAnimationStyle,
	TLGeoShape,
	createShapeId,
	defaultShapeSchemas,
	getSnapshot,
	loadSnapshot,
} from '@tldraw/editor'
import { TestEditor } from './TestEditor'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
})
afterEach(() => {
	editor?.dispose()
})

describe('Default animation style', () => {
	it('is registered on the geo shape schema and exposes the expected enum values', () => {
		expect(defaultShapeSchemas.geo.props.animation).toBe(DefaultAnimationStyle)
		expect([...DefaultAnimationStyle.values]).toEqual(['none', 'spin', 'pulse', 'jiggle'])
		expect(DefaultAnimationStyle.defaultValue).toBe('none')
	})

	it("defaults to 'none' on shape creation", () => {
		const id = createShapeId()
		editor.createShape({ id, type: 'geo' })
		const shape = editor.getShape<TLGeoShape>(id)!
		expect(shape.props.animation).toBe('none')
	})

	it('round-trips a non-default value through the store snapshot', () => {
		const id = createShapeId()
		editor.createShape({ id, type: 'geo' })
		editor.updateShape<TLGeoShape>({ id, type: 'geo', props: { animation: 'spin' } })

		expect(editor.getShape<TLGeoShape>(id)!.props.animation).toBe('spin')

		const snapshot = getSnapshot(editor.store)

		const newEditor = new TestEditor()
		try {
			loadSnapshot(newEditor.store, snapshot)
			const reloaded = newEditor.getShape<TLGeoShape>(id)!
			expect(reloaded.props.animation).toBe('spin')
		} finally {
			newEditor.dispose()
		}
	})
})
