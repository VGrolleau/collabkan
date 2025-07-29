import { ChecklistItem } from "@/types";

type Props = {
    checklist: ChecklistItem[];
    setChecklist: (items: ChecklistItem[]) => void;
    newItem: string;
    setNewItem: (val: string) => void;
    onDelete: () => void;
};

export function ChecklistSection({ checklist, setChecklist, newItem, setNewItem, onDelete }: Props) {
    const updateChecklistItem = (index: number, updated: Partial<ChecklistItem>) => {
        const copy = [...checklist];
        copy[index] = { ...copy[index], ...updated };
        setChecklist(copy);
    };

    const removeChecklistItem = (index: number) => {
        setChecklist(checklist.filter((_, i) => i !== index));
    };

    const addChecklistItem = () => {
        if (newItem.trim()) {
            setChecklist([...checklist, { text: newItem.trim(), done: false }]);
            setNewItem("");
        }
    };

    const progress = checklist.length
        ? Math.round((checklist.filter(i => i.done).length / checklist.length) * 100)
        : 0;

    return (
        <div className="card-section">
            <div className="section-header">
                <h3>Checklist</h3>
                <button onClick={onDelete}>🗑️</button>
            </div>

            {checklist.length > 0 && (
                <div className="progress-bar" style={{ marginBottom: "1rem" }}>
                    <div
                        style={{
                            background: "#4caf50",
                            height: "8px",
                            width: `${progress}%`,
                            transition: "width 0.3s"
                        }}
                    />
                    <small>{progress}%</small>
                </div>
            )}

            <ul>
                {checklist.map((item, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => updateChecklistItem(idx, { done: !item.done })}
                        />
                        <input
                            type="text"
                            value={item.text}
                            onChange={e => updateChecklistItem(idx, { text: e.target.value })}
                            style={{ flex: 1 }}
                        />
                        <button onClick={() => removeChecklistItem(idx)}>❌</button>
                    </li>
                ))}
            </ul>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                    type="text"
                    placeholder="Nouvel élément"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addChecklistItem();
                        }
                    }}
                />
                <button onClick={addChecklistItem}>Ajouter</button>
            </div>
        </div>
    );
}
