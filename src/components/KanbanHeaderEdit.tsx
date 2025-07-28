"use client";

import { useState, useEffect } from "react";
import { Kanban } from "../types";

type Props = {
    kanban: Kanban;
    updateKanbanInfo: (updated: { name?: string; description?: string }) => void;
};

export default function KanbanHeaderEdit({ kanban, updateKanbanInfo }: Props) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDesc, setEditingDesc] = useState(false);
    const [tempName, setTempName] = useState(kanban.name);
    const [tempDesc, setTempDesc] = useState(kanban.description);

    // À chaque changement de kanban, on reset les états pour refléter les bonnes valeurs
    useEffect(() => {
        setTempName(kanban.name);
        setTempDesc(kanban.description);
        setEditingTitle(false);
        setEditingDesc(false);
    }, [kanban.id, kanban.description, kanban.name]);

    const saveTitle = () => {
        updateKanbanInfo({ name: tempName });
        setEditingTitle(false);
    };

    const saveDesc = () => {
        updateKanbanInfo({ description: tempDesc });
        setEditingDesc(false);
    };

    return (
        <div className="kanban-header-edit">
            {/* Edition du titre */}
            {editingTitle ? (
                <div>
                    <input
                        type="text"
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        autoFocus
                    />
                    <button onClick={saveTitle}>💾</button>
                    <button
                        onClick={() => {
                            setTempName(kanban.name);
                            setEditingTitle(false);
                        }}
                    >
                        ✖️
                    </button>
                </div>
            ) : (
                <h2>
                    {kanban.name}{" "}
                    <button onClick={() => setEditingTitle(true)} title="Modifier le titre">
                        ✏️
                    </button>
                </h2>
            )}

            {/* Edition de la description */}
            {editingDesc ? (
                <div>
                    <textarea
                        rows={3}
                        value={tempDesc}
                        onChange={e => setTempDesc(e.target.value)}
                        autoFocus
                    />
                    <button onClick={saveDesc}>💾</button>
                    <button
                        onClick={() => {
                            setTempDesc(kanban.description);
                            setEditingDesc(false);
                        }}
                    >
                        ✖️
                    </button>
                </div>
            ) : (
                <p>
                    {kanban.description}{" "}
                    <button
                        onClick={() => setEditingDesc(true)}
                        title="Modifier la description"
                    >
                        ✏️
                    </button>
                </p>
            )}
        </div>
    );
}
