import { DefaultAnimationStyle, createShapeId, getSnapshot, loadSnapshot } from '@tldraw/editor'
import { TestEditor } from './TestEditor'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
})

describe('animation style prop', () => {
	it('is registered on the geo shape and defaults to none', () => {
		const id = createShapeId()
		editor.createShape({ id, type: 'geo' })
		const shape = editor.getShape(id)!
		expect((shape.props as any).animation).toBe('none')
	})

	it('is a recognized shared style for the selected shape', () => {
		const id = createShapeId()
		editor.createShape({ id, type: 'geo' })
		editor.select(id)
		expect(editor.getSharedStyles().get(DefaultAnimationStyle)).toEqual({
			type: 'shared',
			value: 'none',
		})
	})

	it('survives a round-trip through the store snapshot', () => {
		const id = createShapeId()
		editor.createShape({ id, type: 'geo' })
		editor.updateShape({ id, type: 'geo', props: { animation: 'spin' } })
		expect((editor.getShape(id)!.props as any).animation).toBe('spin')

		const snapshot = getSnapshot(editor.store)

		const newEditor = new TestEditor()
		loadSnapshot(newEditor.store, snapshot)

		expect((newEditor.getShape(id)!.props as any).animation).toBe('spin')
	})
})
