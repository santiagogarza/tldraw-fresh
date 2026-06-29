import {
	NOTE_REACTION_EMOJIS,
	TLNoteReaction,
	TLNoteShape,
	useEditor,
	useIsEditing,
	useValue,
} from '@tldraw/editor'
import {
	type MouseEvent as ReactMouseEvent,
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

interface EmojiReactionGroup {
	emoji: string
	users: TLNoteReaction[]
}

const MAX_CONDENSED_REACTIONS = 3

export function NoteReactions({ shape }: { shape: TLNoteShape }) {
	const editor = useEditor()
	const isEditing = useIsEditing(shape.id)
	const isHovered = useValue('is hovered note', () => editor.getHoveredShapeId() === shape.id, [
		editor,
		shape.id,
	])
	const zoom = useValue('zoom', () => editor.getZoomLevel(), [editor])
	const userId = useValue('current user id', () => editor.user.getId(), [editor])
	const userName = useValue('current user name', () => editor.user.getName() || 'Anonymous', [
		editor,
	])

	const [isPickerOpen, setIsPickerOpen] = useState(false)
	const [isExpandedPinned, setIsExpandedPinned] = useState(false)
	const [isExpandedHovered, setIsExpandedHovered] = useState(false)
	const reactionsRef = useRef<HTMLDivElement>(null)

	const reactions = shape.props.reactions
	const hasReactions = reactions.length > 0
	const shouldShowButton = !hasReactions && (isHovered || isPickerOpen)
	const shouldShowExpanded = hasReactions && (isExpandedPinned || isExpandedHovered)
	const inverseScale = 1 / (zoom * shape.props.scale)

	const groupedReactions = useMemo(() => {
		const map = new Map<string, TLNoteReaction[]>()
		for (const reaction of reactions) {
			const users = map.get(reaction.emoji)
			if (users) {
				users.push(reaction)
			} else {
				map.set(reaction.emoji, [reaction])
			}
		}
		const result: EmojiReactionGroup[] = []
		for (const [emoji, users] of map) {
			result.push({ emoji, users })
		}
		return result
	}, [reactions])

	useEffect(() => {
		if (!hasReactions) {
			setIsExpandedPinned(false)
			setIsExpandedHovered(false)
		}
	}, [hasReactions])

	useEffect(() => {
		if (hasReactions) {
			setIsPickerOpen(false)
		}
	}, [hasReactions])

	useEffect(() => {
		const document = editor.getContainerDocument()
		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null
			if (!target || !reactionsRef.current?.contains(target)) {
				setIsPickerOpen(false)
				setIsExpandedPinned(false)
			}
		}
		document.addEventListener('pointerdown', handlePointerDown)
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
		}
	}, [editor])

	const stopPropagation = useCallback((event: ReactPointerEvent | ReactMouseEvent) => {
		event.stopPropagation()
	}, [])

	const toggleReaction = useCallback(
		(emoji: string) => {
			const currentShape = editor.getShape<TLNoteShape>(shape.id)
			if (!currentShape) return

			const currentReactions = currentShape.props.reactions
			const existingIndex = currentReactions.findIndex(
				(reaction) => reaction.emoji === emoji && reaction.userId === userId
			)
			const nextReactions =
				existingIndex >= 0
					? currentReactions.filter((_, index) => index !== existingIndex)
					: [...currentReactions, { emoji, userId, userName }]

			editor.updateShape({
				id: shape.id,
				type: 'note',
				props: { reactions: nextReactions },
			})
		},
		[editor, shape.id, userId, userName]
	)

	if (isEditing || (!hasReactions && !shouldShowButton)) {
		return null
	}

	return (
		<div
			ref={reactionsRef}
			className="tl-note__reactions"
			style={{
				transform: `scale(${inverseScale})`,
			}}
			onPointerDownCapture={stopPropagation}
			onPointerUpCapture={stopPropagation}
			onClick={stopPropagation}
			onMouseEnter={() => setIsExpandedHovered(true)}
			onMouseLeave={() => setIsExpandedHovered(false)}
		>
			{!hasReactions ? (
				<>
					<button
						type="button"
						className="tl-note__reactions-button"
						title="Add reaction"
						onPointerDown={stopPropagation}
						onClick={() => setIsPickerOpen((open) => !open)}
					>
						😊
					</button>
					{isPickerOpen && (
						<ReactionPicker
							reactions={reactions}
							userId={userId}
							onToggleReaction={toggleReaction}
							className="tl-note__reactions-picker"
						/>
					)}
				</>
			) : (
				<>
					<button
						type="button"
						className="tl-note__reactions-pill"
						title="Show reactions"
						onPointerDown={stopPropagation}
						onClick={() => setIsExpandedPinned((pinned) => !pinned)}
					>
						{groupedReactions.slice(0, MAX_CONDENSED_REACTIONS).map((group) => (
							<span key={group.emoji} className="tl-note__reactions-badge">
								{group.emoji}
							</span>
						))}
						{groupedReactions.length > MAX_CONDENSED_REACTIONS && (
							<span className="tl-note__reactions-more">
								+{groupedReactions.length - MAX_CONDENSED_REACTIONS}
							</span>
						)}
					</button>
					{shouldShowExpanded && (
						<div className="tl-note__reactions-expanded">
							<div className="tl-note__reactions-expanded-list">
								{groupedReactions.map((group) => (
									<div key={group.emoji} className="tl-note__reactions-expanded-row">
										<span className="tl-note__reactions-expanded-emoji">{group.emoji}</span>
										<span className="tl-note__reactions-expanded-users">
											{group.users
												.map((reaction) =>
													reaction.userId === userId ? 'You' : reaction.userName || 'Anonymous'
												)
												.join(', ')}
										</span>
									</div>
								))}
							</div>
							<ReactionPicker
								reactions={reactions}
								userId={userId}
								onToggleReaction={toggleReaction}
								className="tl-note__reactions-expanded-picker"
							/>
						</div>
					)}
				</>
			)}
		</div>
	)
}

function ReactionPicker({
	reactions,
	userId,
	onToggleReaction,
	className,
}: {
	reactions: TLNoteReaction[]
	userId: string
	onToggleReaction(emoji: string): void
	className: string
}) {
	return (
		<div className={className}>
			{NOTE_REACTION_EMOJIS.map((emoji) => {
				const isSelected = reactions.some(
					(reaction) => reaction.emoji === emoji && reaction.userId === userId
				)
				return (
					<button
						key={emoji}
						type="button"
						className="tl-note__reactions-emoji-button"
						data-selected={isSelected}
						onClick={() => onToggleReaction(emoji)}
						title={`React with ${emoji}`}
					>
						{emoji}
					</button>
				)
			})}
		</div>
	)
}
