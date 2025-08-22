import React from "react";
import { Column } from "@/types";
import styles from "./CardModal.module.scss";

type ColumnSelectProps = {
    columns: Column[];
    selectedColumnId: string;
    onChange: (newColumnId: string) => void;
};

const ColumnSelect: React.FC<ColumnSelectProps> = ({ columns, selectedColumnId, onChange }) => {
    return (
        <div className={styles.columnSelect}>
            <h4>Déplacer la carte</h4>
            <select value={selectedColumnId} onChange={(e) => onChange(e.target.value)}>
                {columns.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                ))}
            </select>
        </div>
    );
};

export default ColumnSelect;
