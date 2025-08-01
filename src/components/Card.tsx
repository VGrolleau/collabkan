// src/components/Card.tsx
import { CardElement } from "@/types";
import { format, isBefore, isWithinInterval, addHours } from "date-fns";
import { Clock } from "lucide-react";

type CardProps = {
    card: CardElement;
    onClick: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
    style?: React.CSSProperties;
};

function DueDateTag({ dueDate }: { dueDate?: string }) {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const now = new Date();

    let color = "#ccc";
    let status = "À venir";

    if (isBefore(date, now)) {
        color = "#e53935"; // rouge
        status = "En retard";
    } else if (isWithinInterval(date, { start: now, end: addHours(now, 24) })) {
        color = "#fb8c00"; // orange
        status = "Bientôt";
    }

    return (
        <div
            className="due-date-tag"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                backgroundColor: color,
                color: "#fff",
                padding: "0.3rem 0.6rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
            }}
        >
            <Clock size={14} />
            {format(date, "dd/MM/yyyy HH:mm")} — {status}
        </div>
    );
}


export function Card({ card, onClick, onMoveUp, onMoveDown, isFirst, isLast }: CardProps) {
    return (
        <div className="card-container" style={{ position: "relative", marginBottom: "8px" }}>
            <button
                onClick={onClick}
                className="card"
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", width: "100%", minHeight: 60 }}
            >
                <div>{card.title}</div>
                <DueDateTag dueDate={card.dueDate} />
            </button>
            <div style={{
                position: "absolute",
                right: 4,
                top: 4,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}>
                <button onClick={onMoveUp} disabled={isFirst} style={{ fontSize: "0.8rem" }}>🔼</button>
                <button onClick={onMoveDown} disabled={isLast} style={{ fontSize: "0.8rem" }}>🔽</button>
            </div>
        </div>
    );
}
