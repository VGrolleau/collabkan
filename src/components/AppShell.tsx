// src/components/AppShell.tsx
"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard";
import { Kanban, Column } from "../types";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [kanbans, setKanbans] = useState<Kanban[]>([]);
    const [selected, setSelected] = useState<Kanban | null>(null);

    const handleAddKanban = (data: { title: string; description: string }) => {
        const newKanban: Kanban = {
            id: Date.now(),
            name: data.title,
            description: data.description,
            columns: [
                { id: 1, name: "À faire" },
                { id: 2, name: "En cours" },
                { id: 3, name: "Terminé" },
            ],
        };
        setKanbans((prev) => [...prev, newKanban]);
        setSelected(newKanban);
    };

    const handleDeleteKanban = (id: number) => {
        setKanbans((prev) => prev.filter(k => k.id !== id));
        if (selected?.id === id) {
            setSelected(null);
        }
    };

    const updateKanbanColumns = (columns: Column[]) => {
        if (!selected) return;
        setKanbans((prev) =>
            prev.map(k => (k.id === selected.id ? { ...k, columns } : k))
        );
        setSelected(prev => (prev ? { ...prev, columns } : prev));
    };

    return (
        <>
            <Sidebar
                kanbans={kanbans}
                onSelect={setSelected}
                onAddKanban={handleAddKanban}
                onDeleteKanban={handleDeleteKanban}
            />
            <main>
                {selected ? (
                    <KanbanBoard kanban={selected} updateKanbanColumns={updateKanbanColumns} />
                ) : (
                    <p>{`Bienvenue ! Sélectionnez une collab' pour commencer.`}</p>
                )}
                {children}
            </main>
        </>
    );
}
