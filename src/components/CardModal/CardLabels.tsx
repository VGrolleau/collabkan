import { useState } from "react";
import { Label } from "@/types";

type CardLabelsProps = {
    allLabels: Label[];
    selectedLabels: Label[];
    onChange: (labels: Label[]) => void;
    onDelete: () => void;
    onAdd: (name: string, color: string) => void;
    onUpdate: (label: Label) => void;
    onRemove: (id: number) => void;
};

export function CardLabels({
    allLabels,
    selectedLabels,
    onChange,
    onDelete,
    onAdd,
    onUpdate,
    onRemove,
}: CardLabelsProps) {
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("#000000");
    const [error, setError] = useState("");

    const toggleLabel = (label: Label) => {
        const isSelected = selectedLabels.some(l => l.id === label.id);
        if (isSelected) {
            onChange(selectedLabels.filter(l => l.id !== label.id));
        } else {
            onChange([...selectedLabels, label]);
        }
    };

    const handleAdd = () => {
        const trimmedName = newLabelName.trim();
        if (!trimmedName) {
            setError("Le nom du label est requis");
            return;
        }

        const duplicate = allLabels.some(
            label => label.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (duplicate) {
            setError("Un label avec ce nom existe déjà");
            return;
        }

        onAdd(trimmedName, newLabelColor);
        setNewLabelName("");
        setNewLabelColor("#000000");
        setError("");
    };

    const handleLabelUpdate = (id: number, name: string, color: string) => {
        const updated = { id, name, color };
        onUpdate(updated);
    };

    return (
        <div className="card-labels">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4>Labels</h4>
                <button onClick={onDelete}>✖</button>
            </div>

            <div className="label-list">
                {allLabels.map(label => (
                    <div
                        key={label.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "4px 0",
                            borderBottom: "1px solid #eee",
                        }}
                    >
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input
                                type="checkbox"
                                checked={selectedLabels.some(l => l.id === label.id)}
                                onChange={() => toggleLabel(label)}
                            />
                            <span
                                style={{
                                    backgroundColor: label.color,
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    color: "#fff",
                                    fontSize: "0.9rem",
                                }}
                            >
                                {label.name}
                            </span>
                        </label>

                        <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                            {/* Edition directe ici — tu peux le désactiver si besoin */}
                            <input
                                type="color"
                                value={label.color}
                                onChange={e => handleLabelUpdate(label.id, label.name, e.target.value)}
                            />
                            <button onClick={() => onRemove(label.id)} title="Supprimer">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "1rem" }}>
                <h5>Ajouter un label</h5>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input
                        type="text"
                        placeholder="Nom"
                        value={newLabelName}
                        onChange={e => setNewLabelName(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <input
                        type="color"
                        value={newLabelColor}
                        onChange={e => setNewLabelColor(e.target.value)}
                    />
                    <button onClick={handleAdd}>Ajouter</button>
                </div>
                {error && <p style={{ color: "red", fontSize: "0.8rem" }}>{error}</p>}
            </div>
        </div>
    );
}
