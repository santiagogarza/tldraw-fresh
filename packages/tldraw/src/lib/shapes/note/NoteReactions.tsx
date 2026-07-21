import {
	Editor,
	NOTE_REACTION_EMOJIS,
	TLNoteShape,
	useEditor,
	useValue,
} from '@tldraw/editor'
import { PointerEventHandler, useCallback, useEffect, useRef, useState } from 'react'

function toggleReaction(
	editor: Editor,
	shapeId: TLNoteShape['id'],
	emoji: string,
	userId: string,
	userName: string
) {
	const shape = editor.getShape<TLNoteShape>(shapeId)
	if (!shape) return

	const reactions = shape.props.reactions
	const existing = reactions.find((r) => r.emoji === emoji && r.userId === userId)
	const next = existing
		? reactions.filter((r) => !(r.emoji === emoji && r.userId === userId))
		: [...reactions, { emoji, userId, userName }]

	editor.updateShape({ id: shapeId, type: 'note', props: { reactions: next } })
}

function getUniqueEmojis(reactions: TLNoteShape['props']['reactions']) {
	const seen = new Set<string>()
	const unique: string[] = []
	for (const reaction of reactions) {
		if (!seen.has(reaction.emoji)) {
			seen.add(reaction.emoji)
			unique.push(reaction.emoji)
		}
	}
	return unique
}

function getReactionGroups(reactions: TLNoteShape['props']['reactions']) {
	return getUniqueEmojis(reactions).map((emoji) => ({
		emoji,
		names: reactions.filter((r) => r.emoji === emoji).map((r) => r.userName),
	}))
}

const stopPointerPropagation: PointerEventHandler = (e) => {
	e.stopPropagation()
}

export function NoteReactions({ shape }: { shape: TLNoteShape }) {
	const editor = useEditor()
	const containerRef = useRef<HTMLDivElement>(null)
	const [pickerOpen, setPickerOpen] = useState(false)
	const [expanded, setExpanded] = useState(false)

	const isHovered = useValue(
		'note reactions hovered',
		() => editor.getHoveredShapeId() === shape.id,
		[editor, shape.id]
	)

	const zoom = useValue('zoom', () => editor.getEfficientZoomLevel(), [editor])
	const inverseScale = 1 / (zoom * shape.props.scale)

	const userId = useValue('userId', () => editor.user.getId(), [editor])
	const userName = useValue('userName', () => editor.user.getName() || 'Guest', [editor])

	const reactions = shape.props.reactions
	const hasReactions = reactions.length > 0
	const uniqueEmojis = getUniqueEmojis(reactions)
	const reactionGroups = getReactionGroups(reactions)

	const markAsHandled = useCallback<PointerEventHandler>(
		(e) => {
			stopPointerPropagation(e)
			if (!editor.inputs.getShiftKey()) editor.markEventAsHandled(e)
		},
		[editor]
	)

	const handleToggle = useCallback(
		(emoji: string) => {
			toggleReaction(editor, shape.id, emoji, userId, userName)
		},
		[editor, shape.id, userId, userName]
	)

	useEffect(() => {
		if (!pickerOpen && !expanded) return

		const handlePointerDown = (e: PointerEvent) => {
			if (containerRef.current?.contains(e.target as Node)) return
			setPickerOpen(false)
			setExpanded(false)
		}

		document.addEventListener('pointerdown', handlePointerDown)
		return () => document.removeEventListener('pointerdown', handlePointerDown)
	}, [pickerOpen, expanded])

	if (!hasReactions && !isHovered && !pickerOpen) {
		return null
	}

	const showEmptyButton = !hasReactions && isHovered
	const showPill = hasReactions

	return (
		<div
			ref={containerRef}
			className="tl-note__reactions"
			style={{
				transform: `scale(${inverseScale})`,
			}}
		>
			{showEmptyButton && (
				<>
					<button
						type="button"
						className="tl-note__reactions-button"
						style={{ pointerEvents: 'all' }}
						onPointerDown={markAsHandled}
						onPointerUp={markAsHandled}
						onClick={() => setPickerOpen((open) => !open)}
						aria-label="Add reaction"
					>
						😊
					</button>
					{pickerOpen && (
						<div
							className="tl-note__reactions-expanded"
							style={{ pointerEvents: 'all' }}
							onPointerDown={stopPointerPropagation}
							onPointerUp={stopPointerPropagation}
						>
							<div className="tl-note__reactions-picker">
								{NOTE_REACTION_EMOJIS.map((emoji) => (
									<button
										key={emoji}
										type="button"
										className="tl-note__reactions-picker-button"
										onPointerDown={markAsHandled}
										onPointerUp={markAsHandled}
										onClick={() => handleToggle(emoji)}
									>
										{emoji}
									</button>
								))}
							</div>
						</div>
					)}
				</>
			)}

			{showPill && (
				<>
					<button
						type="button"
						className="tl-note__reactions-pill"
						style={{ pointerEvents: 'all' }}
						onPointerDown={markAsHandled}
						onPointerUp={markAsHandled}
						onClick={() => setExpanded((open) => !open)}
						onMouseEnter={() => setExpanded(true)}
						aria-label="View reactions"
					>
						{uniqueEmojis.slice(0, 3).map((emoji, i) => (
							<span
								key={emoji}
								className="tl-note__reactions-badge"
								style={i > 0 ? { marginLeft: -6 } : undefined}
							>
								{emoji}
							</span>
						))}
						{uniqueEmojis.length > 3 && (
							<span className="tl-note__reactions-more">+{uniqueEmojis.length - 3}</span>
						)}
					</button>
					{expanded && (
						<div
							className="tl-note__reactions-expanded"
							style={{ pointerEvents: 'all' }}
							onPointerDown={stopPointerPropagation}
							onPointerUp={stopPointerPropagation}
							onMouseLeave={() => setExpanded(false)}
						>
							<div className="tl-note__reactions-list">
								{reactionGroups.map(({ emoji, names }) => (
									<div key={emoji} className="tl-note__reactions-row">
										<span className="tl-note__reactions-row-emoji">{emoji}</span>
										<span className="tl-note__reactions-row-names">{names.join(', ')}</span>
									</div>
								))}
							</div>
							<div className="tl-note__reactions-picker">
								{NOTE_REACTION_EMOJIS.map((emoji) => (
									<button
										key={emoji}
										type="button"
										className="tl-note__reactions-picker-button"
										onPointerDown={markAsHandled}
										onPointerUp={markAsHandled}
										onClick={() => handleToggle(emoji)}
									>
										{emoji}
									</button>
								))}
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)
}
