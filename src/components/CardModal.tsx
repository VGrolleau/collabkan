// src/components/CardModal.tsx
"use client";

import { useState, useEffect } from "react";
import { CardElement, ChecklistItem, Column } from "../types";

type Props = {
    card: CardElement;
    kanbanColumns: Column[];
    onClose: () => void;
    onSave: (
        cardId: number | string,
        updatedData: Partial<CardElement> & { columnId?: number }
    ) => void;
    onDelete: (cardId: number | string) => void;
};

export function CardModal({ card, kanbanColumns, onClose, onSave, onDelete }: Props) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist || []);
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [visibleSections, setVisibleSections] = useState<string[]>([]);
    const [columnId, setColumnId] = useState<number | undefined>(undefined);

    useEffect(() => {
        const openSections: string[] = [];
        if (description) openSections.push("description");
        if (checklist.length > 0) openSections.push("checklist");
        setVisibleSections(openSections);

        const currentCol = kanbanColumns.find(col =>
            col.cards.some(c => c.id === card.id)
        );
        setColumnId(currentCol?.id);
    }, [card, kanbanColumns, checklist.length, description]);

    const showSection = (section: string) => {
        if (!visibleSections.includes(section)) {
            setVisibleSections(prev => [...prev, section]);
        }
    };

    const hideSection = (section: string) => {
        setVisibleSections(prev => prev.filter(s => s !== section));
        if (section === "description") setDescription("");
        if (section === "checklist") setChecklist([]);
    };

    const addChecklistItem = () => {
        if (newChecklistItem.trim()) {
            setChecklist(prev => [...prev, { text: newChecklistItem.trim(), done: false }]);
            setNewChecklistItem("");
        }
    };

    const updateChecklistItem = (index: number, updated: Partial<ChecklistItem>) => {
        setChecklist(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], ...updated };
            return copy;
        });
    };

    const removeChecklistItem = (index: number) => {
        setChecklist(prev => prev.filter((_, i) => i !== index));
    };

    const progress = checklist.length
        ? Math.round((checklist.filter(i => i.done).length / checklist.length) * 100)
        : 0;

    const handleSave = () => {
        if (!title.trim()) {
            alert("Le titre ne peut pas être vide");
            return;
        }

        onSave(card.id, {
            title,
            description,
            checklist,
            columnId,
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        style={{ fontSize: "1.5rem", fontWeight: "bold", flex: 1 }}
                    />
                    <button onClick={() => onDelete(card.id)}>🗑️ Supprimer</button>
                </div>

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

                <div className="card-options" style={{ marginTop: "1rem" }}>
                    {!visibleSections.includes("description") && (
                        <button onClick={() => showSection("description")}>
                            ➕ Ajouter une description
                        </button>
                    )}
                    {!visibleSections.includes("checklist") && (
                        <button onClick={() => showSection("checklist")}>
                            ➕ Ajouter une checklist
                        </button>
                    )}
                </div>

                {visibleSections.includes("description") && (
                    <div className="card-section">
                        <div className="section-header">
                            <h3>Description</h3>
                            <button onClick={() => hideSection("description")}>🗑️</button>
                        </div>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ajoutez une description..."
                        />
                    </div>
                )}

                {visibleSections.includes("checklist") && (
                    <div className="card-section">
                        <div className="section-header">
                            <h3>Checklist</h3>
                            <button onClick={() => hideSection("checklist")}>🗑️</button>
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
                                value={newChecklistItem}
                                onChange={e => setNewChecklistItem(e.target.value)}
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
                )}

                <div>
                    <button style={{ marginTop: "1rem" }} onClick={handleSave}>
                        💾 Enregistrer
                    </button>

                    <button onClick={onClose}>✖️ Fermer</button>
                </div>
            </div>
        </div>
    );
}
