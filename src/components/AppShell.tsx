"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard";

type Kanban = {
    id: number;
    name: string;
    description: string;
};

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [kanbans, setKanbans] = useState<Kanban[]>([]);
    const [selected, setSelected] = useState<Kanban | null>(null);

    const handleAddKanban = (kanban: Kanban) => {
        setKanbans((prev) => [...prev, kanban]);
        setSelected(kanban); // Optionnel : sélectionner le nouveau
    };

    const handleDeleteKanban = (id: number) => {
        setKanbans(prev => prev.filter(k => k.id !== id));
        if (selected?.id === id) {
            setSelected(null);
        }
    };

    return (
        <>
            <Sidebar
                kanbans={kanbans}
                onSelect={setSelected}
                onAddKanban={handleAddKanban}
                onDelete={handleDeleteKanban}
            />
            <main>
                {selected ? (
                    <KanbanBoard kanban={selected} />
                ) : (
                    <p>{`Bienvenue ! Sélectionnez une collab' pour commencer.`}</p>
                )}
                {children}
            </main>
        </>
    );
}
