import {
	Editor,
	NOTE_REACTION_EMOJIS,
	TLNoteReaction,
	TLNoteShape,
	TLShapeId,
	useEditor,
	useValue,
} from '@tldraw/editor'
import { PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

function toggleReaction(
	editor: Editor,
	shapeId: TLShapeId,
	emoji: string,
	userId: string,
	userName: string,
	existing: TLNoteReaction[]
) {
	const index = existing.findIndex((r) => r.emoji === emoji && r.userId === userId)
	const next =
		index >= 0 ? existing.filter((_, i) => i !== index) : [...existing, { emoji, userId, userName }]
	editor.updateShape({ id: shapeId, type: 'note', props: { reactions: next } })
}

function ReactionPickerRow({
	shape,
	reactions,
	userId,
	userName,
	onSelect,
}: {
	shape: TLNoteShape
	reactions: TLNoteReaction[]
	userId: string
	userName: string
	onSelect?(): void
}) {
	const editor = useEditor()

	return (
		<div className="tl-note__reactions-picker">
			{NOTE_REACTION_EMOJIS.map((emoji) => {
				const isActive = reactions.some((r) => r.emoji === emoji && r.userId === userId)
				return (
					<button
						key={emoji}
						type="button"
						className="tl-note__reactions-picker-button"
						data-active={isActive ? 'true' : undefined}
						onClick={() => {
							toggleReaction(editor, shape.id, emoji, userId, userName, reactions)
							onSelect?.()
						}}
					>
						{emoji}
					</button>
				)
			})}
		</div>
	)
}

export function NoteReactions({ shape }: { shape: TLNoteShape }) {
	const editor = useEditor()
	const containerRef = useRef<HTMLDivElement>(null)
	const [pickerOpen, setPickerOpen] = useState(false)
	const [expandedPinned, setExpandedPinned] = useState(false)
	const [pillHovered, setPillHovered] = useState(false)

	const isHovered = useValue('note hovered', () => editor.getHoveredShapeId() === shape.id, [
		editor,
		shape.id,
	])

	const zoom = useValue('zoom', () => editor.getEfficientZoomLevel(), [editor])
	const inverseScale = 1 / (zoom * shape.props.scale)

	const reactions = shape.props.reactions
	const hasReactions = reactions.length > 0

	const userId = editor.user.getId()
	const userName = editor.user.getName()

	const uniqueEmojis = useMemo(() => [...new Set(reactions.map((r) => r.emoji))], [reactions])
	const displayEmojis = uniqueEmojis.slice(0, 3)
	const extraCount = Math.max(0, uniqueEmojis.length - 3)

	const groupedReactions = useMemo(
		() =>
			uniqueEmojis.map((emoji) => ({
				emoji,
				names: reactions.filter((r) => r.emoji === emoji).map((r) => r.userName),
			})),
		[reactions, uniqueEmojis]
	)

	const expanded = hasReactions && (pillHovered || expandedPinned)

	useEffect(() => {
		if (!pickerOpen && !expandedPinned) return

		const handlePointerDown = (e: PointerEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setPickerOpen(false)
				setExpandedPinned(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		return () => document.removeEventListener('pointerdown', handlePointerDown)
	}, [pickerOpen, expandedPinned])

	const stopPropagation = useCallback<PointerEventHandler>(
		(e) => {
			e.stopPropagation()
			if (!editor.inputs.getShiftKey()) editor.markEventAsHandled(e)
		},
		[editor]
	)

	if (!hasReactions && !isHovered) return null

	return (
		<div
			ref={containerRef}
			className="tl-note__reactions"
			style={{
				transform: `scale(${inverseScale})`,
			}}
			onPointerDown={stopPropagation}
			onPointerUp={stopPropagation}
		>
			{!hasReactions ? (
				<>
					<button
						type="button"
						className="tl-note__reactions-button"
						style={{ pointerEvents: 'all' }}
						onClick={() => setPickerOpen(true)}
						aria-label="Add reaction"
					>
						🙂
					</button>
					{pickerOpen && (
						<div className="tl-note__reactions-expanded" style={{ pointerEvents: 'all' }}>
							<ReactionPickerRow
								shape={shape}
								reactions={reactions}
								userId={userId}
								userName={userName}
							/>
						</div>
					)}
				</>
			) : expanded ? (
				<div className="tl-note__reactions-expanded" style={{ pointerEvents: 'all' }}>
					<div className="tl-note__reactions-list">
						{groupedReactions.map(({ emoji, names }) => (
							<div key={emoji} className="tl-note__reactions-list-item">
								<span className="tl-note__reactions-list-emoji">{emoji}</span>
								<span className="tl-note__reactions-list-names">{names.join(', ')}</span>
							</div>
						))}
					</div>
					<ReactionPickerRow
						shape={shape}
						reactions={reactions}
						userId={userId}
						userName={userName}
					/>
				</div>
			) : (
				<div
					className="tl-note__reactions-pill"
					style={{ pointerEvents: 'all' }}
					onPointerEnter={() => setPillHovered(true)}
					onPointerLeave={() => setPillHovered(false)}
					onClick={() => setExpandedPinned(true)}
				>
					{displayEmojis.map((emoji, i) => (
						<span
							key={emoji}
							className="tl-note__reactions-badge"
							style={{ marginLeft: i > 0 ? -6 : 0 }}
						>
							{emoji}
						</span>
					))}
					{extraCount > 0 && <span className="tl-note__reactions-more">+{extraCount}</span>}
				</div>
			)}
		</div>
	)
}
