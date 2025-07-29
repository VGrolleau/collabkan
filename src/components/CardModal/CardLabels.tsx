// src/components/CardModal/CardLabels.tsx
"use client";

import { Label } from "@/types";

type Props = {
    allLabels: Label[];
    selectedLabels: Label[];
    onChange: (updated: Label[]) => void;
    onDelete: () => void;
};

export function CardLabels({ allLabels, selectedLabels, onChange, onDelete }: Props) {
    const toggleLabel = (label: Label) => {
        const isSelected = selectedLabels.some(l => l.id === label.id);
        const updated = isSelected
            ? selectedLabels.filter(l => l.id !== label.id)
            : [...selectedLabels, label];
        onChange(updated);
    };

    return (
        <div className="card-section">
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Labels</h3>
                <button onClick={onDelete}>🗑️</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {allLabels.map(label => {
                    const selected = selectedLabels.some(l => l.id === label.id);
                    return (
                        <span
                            key={label.id}
                            onClick={() => toggleLabel(label)}
                            style={{
                                backgroundColor: label.color,
                                color: "#fff",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                opacity: selected ? 1 : 0.4,
                            }}
                        >
                            {label.name}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
