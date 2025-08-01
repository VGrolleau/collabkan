"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
// import { format, isBefore } from "date-fns";
// import { CalendarDays, X } from "lucide-react"; // icônes

type Props = {
    dueDate?: string;
    setDueDate: (date: string | undefined) => void;
    onDelete: () => void;
};

export function DueDateSection({ dueDate, setDueDate, onDelete }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        dueDate ? new Date(dueDate) : null
    );

    const handleChange = (date: Date | null) => {
        setSelectedDate(date);
        setDueDate(date ? date.toISOString() : undefined);
    };

    const now = new Date();

    return (
        <div className="card-section">
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>📆 Échéance</h3>
                <button onClick={onDelete}>🗑️</button>
            </div>

            <DatePicker
                selected={selectedDate}
                onChange={handleChange}
                showTimeSelect
                timeIntervals={15}
                dateFormat="Pp"
                locale={fr}
                placeholderText="Choisir une date et une heure"
                minDate={now}
                className="your-input-style"
            />

            <div className="flex gap-2 mt-2">
                <button
                    className="btn-small"
                    onClick={() => handleChange(new Date())}
                >
                    📍 Aujourd’hui
                </button>
                <button
                    className="btn-small"
                    onClick={() => handleChange(null)}
                >
                    ❌ Effacer
                </button>
            </div>
        </div>
    );
}
