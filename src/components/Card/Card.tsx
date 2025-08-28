// src/components/Card/Card.tsx
import { CardElement, Assignee, Label } from "@/types";
import { format, isBefore, isWithinInterval, addHours } from "date-fns";
import { Clock } from "lucide-react";
import styles from "./Card.module.scss";

type CardProps = {
    card: CardElement;
    onClick: () => void;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>, card: CardElement) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
    draggable?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
};

function DueDateTag({ dueDate }: { dueDate?: string | Date | null }) {
    if (!dueDate) return null;

    const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    const now = new Date();

    let colorClass = styles.grey;
    let status = "À venir";

    if (isBefore(date, now)) {
        colorClass = styles.red;
        status = "En retard";
    } else if (isWithinInterval(date, { start: now, end: addHours(now, 24) })) {
        colorClass = styles.orange;
        status = "Bientôt";
    }

    return (
        <div className={`${styles.dueDateTag} ${colorClass}`}>
            {/* <Clock size={14} /> */}
            ⏰ {format(date, "dd/MM/yyyy HH:mm")}
        </div>
    );
}

function Assignees({ assignees }: { assignees?: Assignee[] }) {
    const getInitials = (name?: string | null) => {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    if (!assignees || assignees.length === 0) return null;

    return (
        <div className={styles.assignees}>
            {assignees.map(a =>
                a.avatarUrl ? (
                    <img key={a.id} src={a.avatarUrl} alt={a.name} className={styles.avatar} />
                ) : (
                    <span key={a.id} className={styles.avatar}>
                        {getInitials(a.name)}
                    </span>
                )
            )}
        </div>
    );
}

export function Card({
    card,
    onClick,
    draggable = false,
    onDragStart,
    onDragEnd,
    isFirst,
    isLast,
    onMoveUp,
    onMoveDown,
}: CardProps) {
    return (
        <div
            className={styles.card}
            draggable={draggable}
            onClick={onClick}
            onDragStart={e => onDragStart && onDragStart(e, card)}
            onDragEnd={e => onDragEnd && onDragEnd(e)}
            data-card-id={card.id}
        >
            {/* Labels */}
            <div className={styles.labels}>
                {(card.labels || []).map((l: Label) => (
                    <span
                        key={l.id}
                        className={styles.label}
                        style={{ backgroundColor: l.color }}
                        title={l.name}
                    >
                        &nbsp;
                    </span>
                ))}
            </div>

            {/* Titre */}
            <div className={styles.title}>{card.title}</div>

            {/* Meta : date + assignés */}
            <div className={styles.cardMeta}>
                <DueDateTag dueDate={card.dueDate} />
                <Assignees assignees={card.assignees} />
            </div>

            {/* Flèches de déplacement */}
            <div className={styles.controls}>
                {onMoveUp && (
                    <button className={styles.button} onClick={onMoveUp} disabled={isFirst}>
                        🔼
                    </button>
                )}
                {onMoveDown && (
                    <button className={styles.button} onClick={onMoveDown} disabled={isLast}>
                        🔽
                    </button>
                )}
            </div>
        </div>
    );
}
