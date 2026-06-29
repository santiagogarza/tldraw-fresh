import {
	Editor,
	NOTE_REACTION_EMOJIS,
	TLNoteReaction,
	TLNoteShape,
	TLShapeId,
	useEditor,
	useValue,
} from '@tldraw/editor'
import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface NoteReactionsProps {
	shape: TLNoteShape
}

interface GroupedReaction {
	emoji: string
	users: TLNoteReaction[]
}

export function NoteReactions({ shape }: NoteReactionsProps) {
	const editor = useEditor()
	const ref = useRef<HTMLDivElement>(null)
	const [isHovered, setIsHovered] = useState(false)
	const [pickerOpen, setPickerOpen] = useState(false)
	const [expandedByClick, setExpandedByClick] = useState(false)

	const isShapeHovered = useValue(
		'note reactions hovered shape',
		() => editor.getHoveredShapeId() === shape.id,
		[editor, shape.id]
	)
	const isEditing = useValue(
		'note reactions editing shape',
		() => editor.getEditingShapeId() === shape.id,
		[editor, shape.id]
	)
	const zoom = useValue('note reactions zoom', () => editor.getZoomLevel(), [editor])
	const userId = useValue('note reactions user id', () => editor.user.getId(), [editor])
	const userName = useValue('note reactions user name', () => editor.user.getName() || 'Guest', [
		editor,
	])

	const reactions = shape.props.reactions
	const hasReactions = reactions.length > 0
	const groupedReactions = useMemo(() => getGroupedReactions(reactions), [reactions])
	const visibleBadges = groupedReactions.slice(0, 3)
	const hiddenBadgeCount = Math.max(0, groupedReactions.length - visibleBadges.length)
	const isExpanded = hasReactions && (isHovered || pickerOpen || expandedByClick)

	useEffect(() => {
		if (!pickerOpen && !expandedByClick) return

		const document = editor.getContainerDocument()

		function handlePointerDown(event: globalThis.PointerEvent) {
			if (!ref.current?.contains(event.target as Node)) {
				setPickerOpen(false)
				setExpandedByClick(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		return () => document.removeEventListener('pointerdown', handlePointerDown)
	}, [editor, pickerOpen, expandedByClick])

	const handlePointerDown = useCallback(
		(event: PointerEvent) => {
			event.stopPropagation()
			editor.markEventAsHandled(event)
		},
		[editor]
	)

	const handleToggleReaction = useCallback(
		(emoji: string) => {
			toggleReaction(editor, shape.id, emoji, userId, userName)
		},
		[editor, shape.id, userId, userName]
	)

	if ((!hasReactions && (!isShapeHovered || isEditing) && !pickerOpen) || zoom <= 0) return null

	const inverseScale = 1 / (zoom * shape.props.scale)
	const offset = 8 / zoom

	return (
		<div
			ref={ref}
			className="tl-note__reactions"
			style={{
				left: offset,
				bottom: offset,
				transform: `scale(${inverseScale})`,
			}}
			onPointerEnter={() => setIsHovered(true)}
			onPointerLeave={() => setIsHovered(false)}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerDown}
		>
			{hasReactions ? (
				isExpanded ? (
					<div className="tl-note__reactions-expanded">
						<div className="tl-note__reactions-list">
							{groupedReactions.map((group) => (
								<div key={group.emoji} className="tl-note__reactions-row">
									<span className="tl-note__reactions-row-emoji">{group.emoji}</span>
									<span className="tl-note__reactions-row-names">
										{group.users.map((reaction) => reaction.userName).join(', ')}
									</span>
								</div>
							))}
						</div>
						<ReactionPicker
							activeReactions={reactions}
							userId={userId}
							onToggleReaction={handleToggleReaction}
						/>
					</div>
				) : (
					<button
						className="tl-note__reactions-pill"
						type="button"
						aria-label="Show note reactions"
						onClick={() => setExpandedByClick((expanded) => !expanded)}
					>
						<span className="tl-note__reactions-badges">
							{visibleBadges.map((group) => (
								<span key={group.emoji} className="tl-note__reactions-badge">
									{group.emoji}
								</span>
							))}
						</span>
						{hiddenBadgeCount > 0 && (
							<span className="tl-note__reactions-more">+{hiddenBadgeCount}</span>
						)}
					</button>
				)
			) : (
				<>
					<button
						className="tl-note__reactions-button"
						type="button"
						aria-label="Add note reaction"
						onClick={() => setPickerOpen((open) => !open)}
					>
						{'\u263A\uFE0F'}
					</button>
					{pickerOpen && (
						<div className="tl-note__reactions-popover">
							<ReactionPicker
								activeReactions={reactions}
								userId={userId}
								onToggleReaction={handleToggleReaction}
							/>
						</div>
					)}
				</>
			)}
		</div>
	)
}

function ReactionPicker({
	activeReactions,
	userId,
	onToggleReaction,
}: {
	activeReactions: TLNoteReaction[]
	userId: string
	onToggleReaction(emoji: string): void
}) {
	return (
		<div className="tl-note__reactions-picker" aria-label="Reaction picker">
			{NOTE_REACTION_EMOJIS.map((emoji) => {
				const isActive = activeReactions.some(
					(reaction) => reaction.emoji === emoji && reaction.userId === userId
				)
				return (
					<button
						key={emoji}
						className="tl-note__reactions-picker-button"
						type="button"
						aria-label={`React with ${emoji}`}
						aria-pressed={isActive}
						onClick={() => onToggleReaction(emoji)}
					>
						{emoji}
					</button>
				)
			})}
		</div>
	)
}

function getGroupedReactions(reactions: TLNoteReaction[]) {
	const groups = new Map<string, GroupedReaction>()
	for (const reaction of reactions) {
		const group = groups.get(reaction.emoji)
		if (group) {
			group.users.push(reaction)
		} else {
			groups.set(reaction.emoji, { emoji: reaction.emoji, users: [reaction] })
		}
	}
	return Array.from(groups.values())
}

function toggleReaction(
	editor: Editor,
	shapeId: TLShapeId,
	emoji: string,
	userId: string,
	userName: string
) {
	const shape = editor.getShape<TLNoteShape>(shapeId)
	if (!shape) return

	const next = shape.props.reactions.some(
		(reaction) => reaction.emoji === emoji && reaction.userId === userId
	)
		? shape.props.reactions.filter(
				(reaction) => !(reaction.emoji === emoji && reaction.userId === userId)
			)
		: [...shape.props.reactions, { emoji, userId, userName }]

	editor.updateShape<TLNoteShape>({
		id: shapeId,
		type: 'note',
		props: { reactions: next },
	})
}
