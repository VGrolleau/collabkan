import React from "react";
import { Column } from "@/types";

type ColumnSelectProps = {
    columns: Column[];
    selectedColumnId: string;
    onChange: (newColumnId: string) => void;
};

const ColumnSelect: React.FC<ColumnSelectProps> = ({ columns, selectedColumnId, onChange }) => {
    return (
        <div style={{ marginBottom: 16 }}>
            <h4>Déplacer vers :</h4>
            <select
                value={selectedColumnId}
                onChange={(e) => onChange(e.target.value)}
                style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
            >
                {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                        {col.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ColumnSelect;
