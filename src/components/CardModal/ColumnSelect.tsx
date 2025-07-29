import { Column } from "@/types";

type Props = {
    columnId: number | undefined;
    setColumnId: (id: number) => void;
    kanbanColumns: Column[];
};

export function ColumnSelect({ columnId, setColumnId, kanbanColumns }: Props) {
    return (
        <div style={{ marginTop: "1rem" }}>
            <label>
                Colonne
                <select
                    value={columnId}
                    onChange={e => setColumnId(Number(e.target.value))}
                    style={{ marginLeft: "0.5rem" }}
                >
                    {kanbanColumns.map(col => (
                        <option key={col.id} value={col.id}>
                            {col.name}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
