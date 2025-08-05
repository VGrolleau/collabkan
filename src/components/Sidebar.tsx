// src/components/Sidebar.tsx
"use client";

import React, { useState } from "react";
import AddKanbanModal from "./AddKanbanModal";
import { Kanban } from "../types";
import LogoutButton from "./LogoutButton";

type Props = {
    kanbans: Kanban[];
    onSelect: (kanban: Kanban) => void;
    onAddKanban: (data: { title: string; description: string }) => void;
    onDeleteKanban: (id: number) => void;
};

export default function Sidebar({
    kanbans,
    onSelect,
    onAddKanban,
    onDeleteKanban,
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = (kanban: Kanban) => {
        const confirmation = prompt(
            `Pour supprimer « ${kanban.name} », tapez son nom :`
        );
        if (confirmation === kanban.name) {
            onDeleteKanban(kanban.id);
        } else {
            alert("Nom incorrect. Suppression annulée.");
        }
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
                            <button onClick={() => handleDelete(k)}>🗑️</button>
                        </li>
                    ))}
                </ul>
                <button onClick={() => setIsModalOpen(true)}>Ajouter un tableau</button>
            </section>

            <LogoutButton />

            {isModalOpen && (
                <AddKanbanModal
                    onClose={() => setIsModalOpen(false)}
                    onAdd={(data) => {
                        onAddKanban(data);
                        setIsModalOpen(false);
                    }}
                />
            )}
        </aside>
    );
}
