// src/components/CardModal/DueDateSection.tsx
"use client";

import { FC } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type DueDateSectionProps = {
    dueDate: string | Date | null;
    onChange: (date: Date | null) => void;
};

export const DueDateSection: FC<DueDateSectionProps> = ({ dueDate, onChange }) => {
    return (
        <div style={{ marginBottom: 16 }}>
            <h4>Date d’échéance</h4>
            <DatePicker
                selected={dueDate ? new Date(dueDate) : null}
                onChange={(date) => onChange(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Choisir date et heure"
                isClearable
                className="due-date-input"
            />
        </div>
    );
};

export default DueDateSection;
