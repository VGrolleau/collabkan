// src/components/Card/Card.tsx
import { CardElement } from "@/types";
import { format, isBefore, isWithinInterval, addHours } from "date-fns";
import { Clock } from "lucide-react";
import styles from "./Card.module.scss";

type CardProps = {
    card: CardElement;
    onClick: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
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
            <Clock size={14} />
            {format(date, "dd/MM/yyyy HH:mm")} — {status}
        </div>
    );
}

export function Card({ card, onClick, onMoveUp, onMoveDown, isFirst, isLast }: CardProps) {
    return (
        <div style={{ position: "relative", marginBottom: 8 }}>
            <button
                onClick={onClick}
                className={styles.card}
            >
                <div>{card.title}</div>
                <DueDateTag dueDate={card.dueDate} />
            </button>

            <div
                style={{
                    position: "absolute",
                    right: 4,
                    top: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <button onClick={onMoveUp} disabled={isFirst} style={{ fontSize: "0.8rem" }}>
                    🔼
                </button>
                <button onClick={onMoveDown} disabled={isLast} style={{ fontSize: "0.8rem" }}>
                    🔽
                </button>
            </div>
        </div>
    );
}
