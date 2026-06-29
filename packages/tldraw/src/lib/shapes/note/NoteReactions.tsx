import {
	NOTE_REACTION_EMOJIS,
	TLNoteReaction,
	TLNoteShape,
	useEditor,
	useValue,
} from '@tldraw/editor'
import { PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SMILEY_EMOJI = '\u{1F642}'
const MAX_CONDENSED_BADGES = 3

interface NoteReactionsProps {
	shape: TLNoteShape
}

/**
 * Hover-revealed reactions UI rendered as a sibling of the note container. It shows a
 * smiley button on empty notes when the user hovers, and a condensed pill (with a
 * who-reacted expansion) once the note has reactions.
 *
 * @internal
 */
export function NoteReactions({ shape }: NoteReactionsProps) {
	const editor = useEditor()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [pickerOpen, setPickerOpen] = useState(false)
	const [expanded, setExpanded] = useState(false)

	const isHovered = useValue('note hovered', () => editor.getHoveredShapeId() === shape.id, [
		editor,
		shape.id,
	])
	const isEditing = useValue('note editing', () => editor.getEditingShapeId() === shape.id, [
		editor,
		shape.id,
	])
	const zoom = useValue('zoom level', () => editor.getZoomLevel(), [editor])

	const reactions = shape.props.reactions

	useEffect(() => {
		if (!pickerOpen && !expanded) return
		function onPointerDown(e: PointerEvent) {
			const target = e.target as Node | null
			if (containerRef.current && target && containerRef.current.contains(target)) {
				return
			}
			setPickerOpen(false)
			setExpanded(false)
		}
		document.addEventListener('pointerdown', onPointerDown, true)
		return () => document.removeEventListener('pointerdown', onPointerDown, true)
	}, [pickerOpen, expanded])

	useEffect(() => {
		if (!isHovered) setExpanded(false)
	}, [isHovered])

	const markHandled = useMemo<PointerEventHandler>(
		() => (e) => editor.markEventAsHandled(e),
		[editor]
	)

	const handleToggle = useCallback(
		(emoji: string) => {
			const userId = editor.user.getId()
			const userName = editor.user.getName()
			const current = editor.getShape<TLNoteShape>(shape.id)
			if (!current) return
			const existing = current.props.reactions
			const index = existing.findIndex((r) => r.emoji === emoji && r.userId === userId)
			let next: TLNoteReaction[]
			if (index === -1) {
				next = [...existing, { emoji, userId, userName }]
			} else {
				next = existing.slice(0, index).concat(existing.slice(index + 1))
			}
			editor.updateShape<TLNoteShape>({
				id: shape.id,
				type: 'note',
				props: { reactions: next },
			})
		},
		[editor, shape.id]
	)

	if (isEditing) return null

	const hasReactions = reactions.length > 0
	const showEmptyButton = !hasReactions && isHovered

	if (!hasReactions && !showEmptyButton && !pickerOpen) return null

	// Inverse scale keeps the pill at a fixed pixel size regardless of zoom or note scale.
	const inverseScale = 1 / (zoom * shape.props.scale)

	const userId = editor.user.getId()
	const groupedByEmoji = groupReactionsByEmoji(reactions, userId)
	const condensedEmojis = groupedByEmoji.slice(0, MAX_CONDENSED_BADGES)
	const overflowCount = groupedByEmoji.length - condensedEmojis.length

	return (
		<div
			ref={containerRef}
			className="tl-note__reactions"
			style={{
				transform: `scale(${inverseScale})`,
			}}
			onPointerDown={markHandled}
			onPointerMove={markHandled}
			onPointerUp={markHandled}
			onClick={(e) => e.stopPropagation()}
		>
			{showEmptyButton && !pickerOpen && (
				<button
					type="button"
					className="tl-note__reactions-button"
					aria-label="Add a reaction"
					onClick={(e) => {
						e.stopPropagation()
						setPickerOpen(true)
					}}
				>
					<span aria-hidden="true">{SMILEY_EMOJI}</span>
				</button>
			)}
			{!hasReactions && pickerOpen && (
				<ReactionPicker
					currentUserId={userId}
					reactions={reactions}
					onPick={(emoji) => {
						handleToggle(emoji)
						setPickerOpen(false)
					}}
				/>
			)}
			{hasReactions && !expanded && (
				<button
					type="button"
					className="tl-note__reactions-pill"
					aria-label={`Reactions, ${reactions.length} total. Click to expand.`}
					onClick={(e) => {
						e.stopPropagation()
						setExpanded(true)
					}}
					onPointerEnter={() => setExpanded(true)}
				>
					{condensedEmojis.map((group, i) => (
						<span
							key={group.emoji}
							className="tl-note__reactions-badge"
							style={i === 0 ? undefined : { marginLeft: -6 }}
						>
							{group.emoji}
						</span>
					))}
					{overflowCount > 0 && (
						<span className="tl-note__reactions-overflow">+{overflowCount}</span>
					)}
				</button>
			)}
			{hasReactions && expanded && (
				<div className="tl-note__reactions-expanded" onPointerLeave={() => setExpanded(false)}>
					<ul className="tl-note__reactions-list">
						{groupedByEmoji.map((group) => (
							<li key={group.emoji} className="tl-note__reactions-list-item">
								<button
									type="button"
									className={
										'tl-note__reactions-list-emoji' +
										(group.includesCurrentUser ? ' tl-note__reactions-list-emoji--active' : '')
									}
									onClick={(e) => {
										e.stopPropagation()
										handleToggle(group.emoji)
									}}
									aria-label={`${group.emoji} from ${group.userNames.join(', ')}. Click to toggle your reaction.`}
								>
									<span aria-hidden="true">{group.emoji}</span>
									<span className="tl-note__reactions-list-count">{group.userNames.length}</span>
								</button>
								<span className="tl-note__reactions-list-names" title={group.userNames.join(', ')}>
									{group.userNames.join(', ')}
								</span>
							</li>
						))}
					</ul>
					<ReactionPicker
						currentUserId={userId}
						reactions={reactions}
						onPick={(emoji) => handleToggle(emoji)}
					/>
				</div>
			)}
		</div>
	)
}

interface ReactionGroup {
	emoji: string
	userNames: string[]
	includesCurrentUser: boolean
}

function groupReactionsByEmoji(
	reactions: TLNoteReaction[],
	currentUserId: string
): ReactionGroup[] {
	const order: string[] = []
	const byEmoji = new Map<string, ReactionGroup>()
	for (const reaction of reactions) {
		let group = byEmoji.get(reaction.emoji)
		if (!group) {
			group = { emoji: reaction.emoji, userNames: [], includesCurrentUser: false }
			byEmoji.set(reaction.emoji, group)
			order.push(reaction.emoji)
		}
		group.userNames.push(reaction.userName || 'Anonymous')
		if (reaction.userId === currentUserId) group.includesCurrentUser = true
	}
	return order.map((emoji) => byEmoji.get(emoji)!)
}

interface ReactionPickerProps {
	currentUserId: string
	reactions: TLNoteReaction[]
	onPick(emoji: string): void
}

function ReactionPicker({ currentUserId, reactions, onPick }: ReactionPickerProps) {
	const activeSet = new Set(reactions.filter((r) => r.userId === currentUserId).map((r) => r.emoji))
	return (
		<div className="tl-note__reactions-picker" role="group" aria-label="Pick a reaction">
			{NOTE_REACTION_EMOJIS.map((emoji) => (
				<button
					key={emoji}
					type="button"
					className={
						'tl-note__reactions-picker-button' +
						(activeSet.has(emoji) ? ' tl-note__reactions-picker-button--active' : '')
					}
					onClick={(e) => {
						e.stopPropagation()
						onPick(emoji)
					}}
					aria-label={`React with ${emoji}`}
					aria-pressed={activeSet.has(emoji)}
				>
					<span aria-hidden="true">{emoji}</span>
				</button>
			))}
		</div>
	)
}
