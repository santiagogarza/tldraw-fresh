import {
	DefaultAnimationStyle,
	defaultShapeSchemas,
	createShapeId,
	loadSnapshot,
	TLGeoShape,
} from '@tldraw/editor'
import { describe, expect, it } from 'vitest'
import { TestEditor } from './TestEditor'

describe('DefaultAnimationStyle', () => {
	it('is registered on geo shape props and defaults to none', () => {
		expect(defaultShapeSchemas.geo.props.animation).toBe(DefaultAnimationStyle)

		const editor = new TestEditor({})
		const id = createShapeId()
		editor.createShapes([{ id, type: 'geo', x: 0, y: 0, props: { w: 100, h: 100 } }])

		const shape = editor.getShape(id)! as TLGeoShape
		expect(shape.props.animation).toBe('none')
	})

	it('round-trips through store serialization', () => {
		const editor = new TestEditor({})
		const id = createShapeId()
		editor.createShapes([{ id, type: 'geo', x: 0, y: 0, props: { w: 100, h: 100 } }])

		editor.updateShape({ id, type: 'geo', props: { animation: 'spin' } })

		const snapshot = editor.store.getStoreSnapshot()
		const newEditor = new TestEditor({})
		loadSnapshot(newEditor.store, snapshot)

		const shape = newEditor.getShape(id)! as TLGeoShape
		expect(shape.props.animation).toBe('spin')
	})
})
