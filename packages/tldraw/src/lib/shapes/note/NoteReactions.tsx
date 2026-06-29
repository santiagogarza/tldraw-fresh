import {
	Editor,
	NOTE_REACTION_EMOJIS,
	TLNoteReaction,
	TLNoteShape,
	TLShapeId,
	useEditor,
	useValue,
} from '@tldraw/editor'
import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'

/** Stop pointer events from reaching the canvas so interacting with the control doesn't drag the note. */
function stopPropagation(e: { stopPropagation(): void }) {
	e.stopPropagation()
}

/**
 * Toggle the current user's reaction with a given emoji on a note shape. Reactions are keyed
 * by the `(emoji, userId)` pair, so toggling removes an existing matching reaction or adds a
 * new one otherwise.
 */
function toggleReaction(
	editor: Editor,
	shapeId: TLShapeId,
	emoji: string,
	userId: string,
	userName: string
) {
	const shape = editor.getShape<TLNoteShape>(shapeId)
	if (!shape) return

	const existing = shape.props.reactions
	const hasReacted = existing.some((r) => r.emoji === emoji && r.userId === userId)

	const next = hasReacted
		? existing.filter((r) => !(r.emoji === emoji && r.userId === userId))
		: [...existing, { emoji, userId, userName }]

	editor.markHistoryStoppingPoint('toggle note reaction')
	editor.updateShape<TLNoteShape>({ id: shapeId, type: 'note', props: { reactions: next } })
}

/** Group reactions by emoji, preserving the order in which each emoji first appeared. */
function groupReactions(reactions: TLNoteReaction[]) {
	const grouped: { emoji: string; users: TLNoteReaction[] }[] = []
	for (const reaction of reactions) {
		let group = grouped.find((g) => g.emoji === reaction.emoji)
		if (!group) {
			group = { emoji: reaction.emoji, users: [] }
			grouped.push(group)
		}
		group.users.push(reaction)
	}
	return grouped
}

/**
 * A hover-revealed reactions control rendered at the lower-left of a note shape. When a note has
 * no reactions, hovering reveals a smiley button that opens an emoji picker. Once reactions exist,
 * a condensed pill shows the reacted emojis and expands to reveal who reacted plus the picker.
 *
 * @internal
 */
export function NoteReactions({ shape }: { shape: TLNoteShape }) {
	const editor = useEditor()
	const ref = useRef<HTMLDivElement>(null)
	const [pickerOpen, setPickerOpen] = useState(false)
	const [expanded, setExpanded] = useState(false)

	const reactions = shape.props.reactions
	const hasReactions = reactions.length > 0

	const isHovered = useValue(
		'note reactions hovered',
		() => editor.getHoveredShapeId() === shape.id,
		[editor, shape.id]
	)
	const isEditing = useValue(
		'note reactions editing',
		() => editor.getEditingShapeId() === shape.id,
		[editor, shape.id]
	)
	// Keep the control at a fixed pixel size regardless of camera zoom or note scale.
	const inverseScale = useValue('note reactions inverse scale', () => 1 / editor.getZoomLevel(), [
		editor,
	])

	const userId = editor.user.getId()
	const userName = editor.user.getName()

	useEffect(() => {
		if (!pickerOpen && !expanded) return
		function handlePointerDown(e: PointerEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setPickerOpen(false)
				setExpanded(false)
			}
		}
		document.addEventListener('pointerdown', handlePointerDown, true)
		return () => document.removeEventListener('pointerdown', handlePointerDown, true)
	}, [pickerOpen, expanded])

	if (isEditing) return null
	if (!hasReactions && !isHovered && !pickerOpen) return null

	const grouped = groupReactions(reactions)

	const picker = (
		<div className="tl-note__reactions-picker" onPointerDown={stopPropagation}>
			{NOTE_REACTION_EMOJIS.map((emoji) => {
				const active = reactions.some((r) => r.emoji === emoji && r.userId === userId)
				return (
					<button
						key={emoji}
						type="button"
						className={classNames('tl-note__reactions-picker-button', {
							'tl-note__reactions-picker-button--active': active,
						})}
						onPointerDown={stopPropagation}
						onClick={(e) => {
							stopPropagation(e)
							toggleReaction(editor, shape.id, emoji, userId, userName)
						}}
					>
						{emoji}
					</button>
				)
			})}
		</div>
	)

	return (
		<div ref={ref} className="tl-note__reactions" style={{ transform: `scale(${inverseScale})` }}>
			<div className="tl-note__reactions-inner" onPointerLeave={() => setExpanded(false)}>
				{!hasReactions ? (
					<>
						<button
							type="button"
							className="tl-note__reactions-button"
							title="Add reaction"
							onPointerDown={stopPropagation}
							onClick={(e) => {
								stopPropagation(e)
								setPickerOpen((open) => !open)
							}}
						>
							{'\u{1F642}'}
						</button>
						{pickerOpen && <div className="tl-note__reactions-popover">{picker}</div>}
					</>
				) : (
					<>
						<button
							type="button"
							className="tl-note__reactions-pill"
							onPointerDown={stopPropagation}
							onPointerEnter={() => setExpanded(true)}
							onClick={(e) => {
								stopPropagation(e)
								setExpanded((open) => !open)
							}}
						>
							{grouped.slice(0, 3).map((group, i) => (
								<span
									key={group.emoji}
									className="tl-note__reactions-badge"
									style={i > 0 ? { marginLeft: -6 } : undefined}
								>
									{group.emoji}
								</span>
							))}
							{grouped.length > 3 && (
								<span className="tl-note__reactions-more">{`+${grouped.length - 3}`}</span>
							)}
						</button>
						{expanded && (
							<div className="tl-note__reactions-expanded" onPointerDown={stopPropagation}>
								<div className="tl-note__reactions-list">
									{grouped.map((group) => (
										<div key={group.emoji} className="tl-note__reactions-list-row">
											<span className="tl-note__reactions-badge">{group.emoji}</span>
											<span className="tl-note__reactions-names">
												{group.users.map((u) => u.userName).join(', ')}
											</span>
										</div>
									))}
								</div>
								{picker}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}
