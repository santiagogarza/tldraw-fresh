import {
	Editor,
	NOTE_REACTION_EMOJIS,
	TLNoteReaction,
	TLNoteShape,
	useEditor,
	useValue,
} from '@tldraw/editor'
import classNames from 'classnames'
import { PointerEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

function toggleReaction(
	editor: Editor,
	shape: TLNoteShape,
	emoji: string,
	userId: string,
	userName: string
) {
	const reactions = shape.props.reactions
	const exists = reactions.some((r) => r.emoji === emoji && r.userId === userId)
	const next: TLNoteReaction[] = exists
		? reactions.filter((r) => !(r.emoji === emoji && r.userId === userId))
		: [...reactions, { emoji, userId, userName }]

	editor.updateShape({
		id: shape.id,
		type: 'note',
		props: { reactions: next },
	})
}

function groupReactionsByEmoji(reactions: TLNoteReaction[]) {
	const grouped = new Map<string, string[]>()
	for (const reaction of reactions) {
		const names = grouped.get(reaction.emoji) ?? []
		names.push(reaction.userName)
		grouped.set(reaction.emoji, names)
	}
	return grouped
}

const stopPointerPropagation: PointerEventHandler = (e) => {
	e.stopPropagation()
}

export function NoteReactions({ shape }: { shape: TLNoteShape }) {
	const editor = useEditor()
	const containerRef = useRef<HTMLDivElement>(null)
	const [pickerOpen, setPickerOpen] = useState(false)
	const [expanded, setExpanded] = useState(false)
	const [isPillHovered, setIsPillHovered] = useState(false)

	const { reactions, scale } = shape.props
	const hasReactions = reactions.length > 0

	const isHovered = useValue('is note hovered', () => editor.getHoveredShapeId() === shape.id, [
		editor,
		shape.id,
	])

	const inverseScale = useValue(
		'note reactions inverse scale',
		() => 1 / (editor.getEfficientZoomLevel() * scale),
		[editor, scale]
	)

	const userId = useValue('user id', () => editor.user.getId(), [editor])
	const userName = useValue('user name', () => editor.user.getName(), [editor])

	const uniqueEmojis = useMemo(() => {
		const seen = new Set<string>()
		const result: string[] = []
		for (const reaction of reactions) {
			if (!seen.has(reaction.emoji)) {
				seen.add(reaction.emoji)
				result.push(reaction.emoji)
			}
		}
		return result
	}, [reactions])

	const groupedReactions = useMemo(() => groupReactionsByEmoji(reactions), [reactions])

	const userReactedEmojis = useMemo(
		() => new Set(reactions.filter((r) => r.userId === userId).map((r) => r.emoji)),
		[reactions, userId]
	)

	const showExpanded = expanded || isPillHovered
	const showEmptyButton = !hasReactions && (isHovered || pickerOpen)
	const showPicker = pickerOpen || (hasReactions && showExpanded)

	const handleToggle = useCallback(
		(emoji: string) => {
			toggleReaction(editor, shape, emoji, userId, userName)
		},
		[editor, shape, userId, userName]
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

	const condensedEmojis = uniqueEmojis.slice(0, 3)
	const extraEmojiCount = uniqueEmojis.length - condensedEmojis.length

	return (
		<div
			ref={containerRef}
			className="tl-note__reactions"
			style={{
				transform: `scale(${inverseScale})`,
			}}
		>
			{showEmptyButton && (
				<button
					type="button"
					className="tl-note__reactions-button"
					onPointerDown={stopPointerPropagation}
					onPointerUp={stopPointerPropagation}
					onClick={() => setPickerOpen((open) => !open)}
					aria-label="Add reaction"
				>
					😊
				</button>
			)}

			{hasReactions && (
				<div
					className={classNames('tl-note__reactions-pill', {
						'tl-note__reactions-pill--expanded': showExpanded,
					})}
					onPointerDown={stopPointerPropagation}
					onPointerUp={stopPointerPropagation}
					onMouseEnter={() => setIsPillHovered(true)}
					onMouseLeave={() => setIsPillHovered(false)}
					onClick={() => setExpanded((open) => !open)}
				>
					{!showExpanded ? (
						<div className="tl-note__reactions-pill-condensed">
							{condensedEmojis.map((emoji, index) => (
								<span
									key={emoji}
									className="tl-note__reactions-badge"
									style={{ zIndex: condensedEmojis.length - index }}
								>
									{emoji}
								</span>
							))}
							{extraEmojiCount > 0 && (
								<span className="tl-note__reactions-extra">+{extraEmojiCount}</span>
							)}
						</div>
					) : (
						<div className="tl-note__reactions-expanded">
							<div className="tl-note__reactions-list">
								{Array.from(groupedReactions.entries()).map(([emoji, names]) => (
									<div key={emoji} className="tl-note__reactions-list-item">
										<span className="tl-note__reactions-list-emoji">{emoji}</span>
										<span className="tl-note__reactions-list-names">{names.join(', ')}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{showPicker && (
				<div
					className="tl-note__reactions-picker"
					onPointerDown={stopPointerPropagation}
					onPointerUp={stopPointerPropagation}
				>
					{NOTE_REACTION_EMOJIS.map((emoji) => (
						<button
							key={emoji}
							type="button"
							className={classNames('tl-note__reactions-picker-button', {
								'tl-note__reactions-picker-button--active': userReactedEmojis.has(emoji),
							})}
							onClick={() => handleToggle(emoji)}
							aria-label={`React with ${emoji}`}
						>
							{emoji}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
