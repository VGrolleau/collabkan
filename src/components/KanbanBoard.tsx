// src/components/KanbanBoard.tsx
"use client";

import { useState } from "react";
import { Kanban, Column } from "../types";

type Props = {
    kanban: Kanban;
    updateKanbanColumns: (columns: Column[]) => void;
};

export default function KanbanBoard({ kanban, updateKanbanColumns }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newColumnName, setNewColumnName] = useState("");

    const addColumn = () => {
        const name = prompt("Nom de la nouvelle colonne ?");
        if (name?.trim()) {
            const newCol = { id: Date.now(), name: name.trim() };
            updateKanbanColumns([...kanban.columns, newCol]);
        }
    };

    const deleteColumn = (id: number) => {
        if (confirm("Supprimer cette colonne ?")) {
            updateKanbanColumns(kanban.columns.filter(c => c.id !== id));
        }
    };

    const saveEdit = (id: number) => {
        updateKanbanColumns(
            kanban.columns.map(c =>
                c.id === id ? { ...c, name: newColumnName.trim() } : c
            )
        );
        setEditingId(null);
    };

    return (
        <section>
            <h2>{kanban.name}</h2>
            <p>{kanban.description}</p>
            <div className="cols-section">
                {kanban.columns.map((col) => (
                    <div className="kanban-column" key={col.id}>
                        {editingId === col.id ? (
                            <>
                                <input
                                    type="text"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                />
                                <button onClick={() => saveEdit(col.id)}>💾</button>
                                <button onClick={() => setEditingId(null)}>✖️</button>
                            </>
                        ) : (
                            <>
                                <h3>{col.name}</h3>
                                <div className="column-actions">
                                    <button onClick={() => { setEditingId(col.id); setNewColumnName(col.name); }}>✏️</button>
                                    <button onClick={() => deleteColumn(col.id)}>🗑️</button>
                                </div>
                            </>
                        )}
                        <div className="cards-list"></div>
                    </div>
                ))}
                <button className="add-col-btn" onClick={addColumn}>➕ Ajouter une colonne</button>
            </div>
        </section>
    );
}
