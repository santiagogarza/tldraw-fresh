import {
	DefaultAnimationStyle,
	defaultShapeSchemas,
	type TLGeoShape,
	createShapeId,
} from '@tldraw/editor'
import { describe, expect, it } from 'vitest'
import { TestEditor } from './TestEditor'

describe('animation style', () => {
	it('registers on geo props and defaults to none on shape creation', () => {
		expect(defaultShapeSchemas.geo.props.animation).toBe(DefaultAnimationStyle)

		const editor = new TestEditor()
		try {
			const id = createShapeId('geo-animation-default')
			editor.createShape({ id, type: 'geo', x: 0, y: 0, props: { w: 100, h: 100 } })

			const shape = editor.getShape(id) as TLGeoShape
			expect(shape.props.animation).toBe('none')
		} finally {
			editor.dispose()
		}
	})

	it('round-trips animation through store snapshots', () => {
		const id = createShapeId('geo-animation-roundtrip')
		const editor = new TestEditor()

		try {
			editor.createShape({ id, type: 'geo', x: 0, y: 0, props: { w: 120, h: 80 } })
			editor.updateShape({ id, type: 'geo', props: { animation: 'spin' } })

			const snapshot = editor.store.getStoreSnapshot()
			const nextEditor = new TestEditor()

			try {
				nextEditor.loadSnapshot(snapshot)
				const nextShape = nextEditor.getShape(id) as TLGeoShape
				expect(nextShape.props.animation).toBe('spin')
			} finally {
				nextEditor.dispose()
			}
		} finally {
			editor.dispose()
		}
	})
})
