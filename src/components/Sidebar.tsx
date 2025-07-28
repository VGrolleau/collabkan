"use client";

import React, { useState } from "react";
import AddKanbanModal from "./AddKanbanModal";

type Kanban = {
    id: number;
    name: string;
    description: string;
};

type Props = {
    kanbans: Kanban[];
    onSelect: (kanban: Kanban) => void;
    onAddKanban: (kanban: Kanban) => void;
    onDelete?: (id: number) => void;
};

export default function Sidebar({ kanbans, onSelect, onAddKanban, onDelete }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAdd = (data: { title: string; description: string }) => {
        const newKanban = {
            id: Date.now(),
            name: data.title,
            description: data.description,
        };
        onAddKanban(newKanban);
    };

    return (
        <aside>
            <h1>{`Collab'Kan`}</h1>
            <section>
                <h2>{`Mes collab' :`}</h2>
                <ul>
                    {kanbans.map((k) => (
                        <li key={k.id}>
                            <button onClick={() => onSelect(k)}>{k.name}</button>
                            <button onClick={() => onDelete?.(k.id)}>🗑️</button>
                        </li>
                    ))}
                </ul>
                <button onClick={() => setIsModalOpen(true)}>Ajouter un tableau</button>
            </section>

            {isModalOpen && (
                <AddKanbanModal
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleAdd}
                />
            )}
        </aside>
    );
}
